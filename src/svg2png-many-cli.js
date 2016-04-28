'use strict';

import svg2png from './svg2png-many';
import yargs from "yargs";

export function run() {
    const argv = yargs
        .option('i', {
            alias: "input",
            type: "string",
            describe: "Path to dir with svg files"
        })
        .option('o', {
            alias: 'output',
            type: 'string',
            describe: 'Path to dir with results, it not defined, input will be used'
        })
        .option('w', {
            alias: 'width',
            type: 'number',
            describe: 'With of result png'
        })
        .option('h', {
            alias: 'height',
            type: 'number',
            describe: 'Height of result png'
        })
        .option('t', {
            alias: 'threads',
            type: 'number',
            describe: 'Number of threads'
        })
        .option('phantom', {
            type: 'string',
            describe: 'Path to alternative phantom'
        })
        .demand(['i'])
        .addHelpOpt("help")
        .argv;

    let { i: srcDir, o: dstDir, w: width, h: height, t: threads, phantom: phantomPath } = argv;
    dstDir = dstDir || srcDir;
    if (phantomPath) {
        // TODO this hack allows override path to default PhantomJS path from path from phantom module
        // find better way to configure this
        let phantom = require('phantomjs-prebuilt');
        phantom.path = phantomPath;
    }
    svg2png(srcDir, dstDir, {width, height}, threads)
        .then(results => {
            if (Array.isArray(results)) {
                console.log(`${results.length} files have been converted successfully`);
            } else {
                console.log(`Completed with result ${results}`);
            }
        }, errors => {
            if (!Array.isArray(errors)) {
                errors = [errors];
            }
            console.error(`Completed with ${errors.length} errors`);
            errors.forEach(error => console.error(error.stack || error));
        });
}