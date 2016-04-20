'use strict';

const phantom = require('phantom'),
    fs = require('fs'),
    path = require('path');

const SVG_REGEX = /\.svg$/i;

/**
 * How many pages can be opened simultaneously in PhantomJS
 * @type {number}
 */
const SIMULTANEOUS_PAGES = 1;

const DEBUG = true; //typeof v8debug === 'object';

/**
 * @typedef {object} Sizes
 * @prop {number} [height]
 * @prop {number} [width]
 */

module.exports = {
    svg2PngFiles,
    svg2PngDir
};

/**
 * @param fileMap {object.<string, string>} key - src file path, value - dst file path
 * @param {Sizes} [size]
 */
function svg2PngFiles(fileMap, size) {
    let phantomInstance;
    const closePhantom = () => {
        if (phantomInstance) {
            log('close phantom instance');
            phantomInstance.exit();
        }
    };
    return phantom.create()
        .then(instance => {
            log('phantom instance created');
            phantomInstance = instance;
            return convertMany(instance, fileMap, size);
        })
        .then(() => closePhantom(), errors => {
            closePhantom();
            return Promise.reject(errors);
        });
}

/**
 * @param {string} srcDir
 * @param {string} dstDir
 * @param {Sizes} [size]
 */
function svg2PngDir(srcDir, dstDir, size) {
    return new Promise((resolve, reject) => {
        fs.readdir(srcDir, (error, files) => {
            if (error) {
                return reject(error);
            }
            files = files.filter(file => SVG_REGEX.test(file));
            let fileMap = {};
            files.forEach(file => {
                let srcFile = path.join(srcDir, file);
                let dstFile = path.join(dstDir, path.parse(file).name + '.png');
                fileMap[srcFile] = dstFile;
            });
            resolve(fileMap);
        });
    }).then(fileMap => svg2PngFiles(fileMap, size));
}

/**
 * @param {object} instance Phantom instance
 * @param {string} srcPath
 * @param {string} dstPath
 * @param {Sizes} [size]
 * @returns {Promise.<string>} resolved with dstPath if success
 */
function convert(instance, srcPath, dstPath, size) {
    return Promise.all([instance.createPage(), fileToBase64(srcPath)])
        .then(results => {
            let page = results[0];
            let pageContent = results[1];
            page.property('onConsoleMessage', log);
            // page.property('onErrors', (msg, stack) => {
            //     console.log('Error!!!');
            //     console.error(msg);
            //     console.error(stack);
            // });            
            // page.property('onResourceError', (error) => {
            //     console.log('Oshibka');
            //     console.error(error);
            // });
            return page.open(pageContent)
                .then(status => {
                    if (status !== "success") {
                        let errMsg = `File ${srcPath} has been opened with status ${status}`;
                        logError(errMsg);
                        throw new Error(errMsg);
                    }
                    log(`${srcPath} opened`);
                    size = size || {};
                    log(`set ${srcPath} sizes to ${JSON.stringify(size)}`);
                    return page.evaluate(setSVGDimensions, size || {})
                        .then(() => page.evaluate(getSVGDimensions))
                        .then((res, some) => console.log(1111, res, some), () => console.error(99999))
                        .then(dimensions => page.evaluate(setSVGDimensions, dimensions))
                        .then(() => console.log(2222), () => console.error(88888))
                        .then(dimensions => page.property('viewportSize', dimensions))
                })
                .then(() => log(`${srcPath} ready to save as ${dstPath}`))
                .then(() => page.render(dstPath))
                .then(() => page.close())
                .then(() => dstPath);
        });
}

/**
 *
 * @param {object} instance PhantomJS instance
 * @param {object.<string, string>} fileMap key - src file path, value - dst file path
 * @param {Sizes} [size]
 * @returns {Promise}
 */
function convertMany(instance, fileMap, size) {
    return new Promise((resolveAll, rejectAll) => {
        const results = [];
        const errors = [];
        const poolCapacity = SIMULTANEOUS_PAGES;
        var restWorkers = Object.keys(fileMap).map(srcPath =>
            () => convert(instance, srcPath, fileMap[srcPath], size));
        log(`${restWorkers.length} files will be processed`);
        var waitedCount = restWorkers.length;
        var startWorker = worker => {
            return Promise.resolve(worker()).then(result => {
                results.push(result);
            }, error => {
                errors.push(error);
            });
        };
        var processNext = () => {
            if (restWorkers.length > 0) {
                let nextWorker = restWorkers.pop();
                startWorker(nextWorker).then(processNext);
            } else if (errors.length + results.length >= Object.keys(fileMap).length) {
                if (errors.length > 0) {
                    rejectAll(errors);
                } else {
                    resolveAll(errors);
                }
            }
        };
        restWorkers.splice(0, poolCapacity).forEach(worker => {
            startWorker(worker).then(processNext);
        });
    });
}

/**
 * @param {string} filePath
 * @returns {Promise.<string>} resolved with base64 file data
 */
function fileToBase64(filePath) {
    const dataPrefix = 'data:image/svg+xml;base64,';
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (error, data) => {
            if (error) {
                return reject(error);
            }
            var base64Data = new Buffer(data).toString('base64');
            resolve(dataPrefix + base64Data);
        });
    });
}

function log() {
    DEBUG && console.log.apply(console, arguments);
}

function logError() {
    DEBUG && console.error.apply(console, arguments);
}

/**
 * Get actual sizes of root elem
 * Interpreted by PhantomJS
 * @returns {Sizes|null}
 */
function getSVGDimensions() {
    /* global document: true */

    var el = document.documentElement;
    if (!el.viewBox) {
        throw new Error('Oooops');
        //return null;
    }

    var widthIsPercent = /%\s*$/.test(el.getAttribute("width") || ""); // Phantom doesn't have endsWith
    var heightIsPercent = /%\s*$/.test(el.getAttribute("height") || "");
    var width = !widthIsPercent && parseFloat(el.getAttribute("width"));
    var height = !heightIsPercent && parseFloat(el.getAttribute("height"));

    if (width && height) {
        return {width: width, height: height};
    }

    var viewBoxWidth = el.viewBox.animVal.width;
    var viewBoxHeight = el.viewBox.animVal.height;

    if (width && viewBoxHeight) {
        return {width: width, height: width * viewBoxHeight / viewBoxWidth};
    }

    if (height && viewBoxWidth) {
        return {width: height * viewBoxWidth / viewBoxHeight, height: height};
    }

    return null;
}

/**
 * Set sizes to root elem
 * Interpreted by PhantomJS
 * @param {Sizes} sizes
 * @returns {Sizes} same as size param
 */
function setSVGDimensions(sizes) {

    var height = sizes.height;
    var width = sizes.width;

    /* global document: true */
    if (!width && !height) {
        return sizes;
    }

    var el = document.documentElement;

    if (!!width) {
        el.setAttribute("width", width + "px");
    } else {
        el.removeAttribute("width");
    }

    if (!!height) {
        el.setAttribute("height", height + "px");
    } else {
        el.removeAttribute("height");
    }
    return sizes;
}