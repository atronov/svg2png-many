'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.run = run;

var _svg2pngMany = require('./svg2png-many');

var _svg2pngMany2 = _interopRequireDefault(_svg2pngMany);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function run() {
    var argv = _yargs2.default.option('i', {
        alias: "input",
        type: "string",
        describe: "Path to dir with svg files"
    }).option('o', {
        alias: 'output',
        type: 'string',
        describe: 'Path to dir with results, it not defined, input will be used'
    }).option('w', {
        alias: 'width',
        type: 'number',
        describe: 'With of result png'
    }).option('h', {
        alias: 'height',
        type: 'number',
        describe: 'Height of result png'
    }).option('t', {
        alias: 'threads',
        type: 'number',
        describe: 'Number of threads'
    }).option('phantom', {
        type: 'string',
        describe: 'Path to alternative phantom'
    }).demand(['i']).addHelpOpt("help").argv;

    var srcDir = argv.i,
        dstDir = argv.o,
        width = argv.w,
        height = argv.h,
        threads = argv.t,
        phantomPath = argv.phantom;

    dstDir = dstDir || srcDir;
    if (phantomPath) {
        // TODO this hack allows override path to default PhantomJS path from path from phantom module
        // find better way to configure this
        var phantom = require('phantomjs-prebuilt');
        phantom.path = phantomPath;
    }
    (0, _svg2pngMany2.default)(srcDir, dstDir, { width: width, height: height }, threads).then(function (results) {
        if (Array.isArray(results)) {
            console.log(results.length + ' files have been converted successfully');
        } else {
            console.log('Completed with result ' + results);
        }
    }, function (errors) {
        if (!Array.isArray(errors)) {
            errors = [errors];
        }
        console.error('Completed with ' + errors.length + ' errors');
        errors.forEach(function (error) {
            return console.error(error.stack || error);
        });
    });
}