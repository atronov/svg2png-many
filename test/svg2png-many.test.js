'use strict';

const svg2png = require('../index');

svg2png.svg2PngDir('../tests', '../results')
    .then(() => console.log('Done'), errors => {
        if (!Array.isArray(errors)) {
            errors = [errors];
        }
        errors.forEach(err => console.error(err.stack || err));
    });