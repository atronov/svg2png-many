'use strict';

const svg2png = require('../index');

console.log('Go');
svg2png.svg2PngDir('../tmp', '../results', {width: 500, height: 500})
    .then(() => console.log('Done'), errors => {
    console.error('Errors !!!');
        if (!Array.isArray(errors)) {
            errors = [errors];
        }
        errors.forEach(err => console.error(err.stack || err));
    });