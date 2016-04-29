# svg2png-many
NodeJS module and CLI to convert **many** svg files to png rapidly.

Inspired by [svg2png](https://github.com/domenic/svg2png) and [phantomjs-node](https://github.com/amir20/phantomjs-node). Many thanks to them.

The main difference from [svg2png](https://github.com/domenic/svg2png) that it works **much faster** convering many files.
Because of it uses one PhantomJS instenct for many files and opens many web-pages simultaniously.

## Using as NodeJS module
**NOTE!** All functions below return a promise.

Convert all svg from certain folder to the other folder.
```javascript
const svg2png = require('svg2png-many');
var srcDir = 'dir/with/source/svgs';
var dstDir = 'dir/with/result/pngs';
svg2png(srcDir, dstDir).then(
  () => console.log('Done'),
  // rejected with the list of all happened errors
  // even if error happens while processing one file it will not stop conversion other files
  // first all files are processed, only then the result promise is rejected or resolved
  errors => errors.forEach(error => {
    arrors = Array.isArray(errors) ? errors : [errors];
    console.error(error.stack || error);
  })
);

// same function can be run as alias
svg2png.svg2PngDir(srcDir, dstDir);
```
Convert only certain files to defined destination.<br/>
All possible arguments described below are also accepted by this function.
```javascript
var fileMap = {
  'one/file/to/convert.svg': 'first/file/result/image.png',
  'second/file/to/process.svg': 'other/place/to/save/result.png'
};
svg2png.svg2PngFiles(fileMap);
```

Define sizes of result png.<br/>
Height or/and width can be skipped. Aspect ration is preserved.
```javascript
var sizes = {
	height: 300,
	width: 500
};
svg2png(srcDir, dstDir, sizes);
```

Define how many web-pages can be opened in PhantomJS simultaneously.<br/>
This argument manages performance aspects. The higher this argument is the faster conversion, but more memory is consumed.<br/>
Default value is 20.
```javascript
var parallelPages = 10;
svg2png(srcDir, dstDir, null, parallelPages);
```

## Using as CLI
To convert all svg files from one folter and put png to the other
```bash
$ ./node_modules/.bin/svg2png-many -i dir/with/source/svgs/ -o dir/with/result/pngs/
3 files have been converted successfully
```
To see all possible argument, run with help option
```bash
$ ./node_modules/.bin/svg2png-many --help
Options:
  -i, --input    Path to dir with svg files                  [string] [required]
  -o, --output   Path to dir with results, it not defined, input will be used
                                                                        [string]
  -w, --width    With of result png                                     [number]
  -h, --height   Height of result png                                   [number]
  -t, --threads  Number of threads                                      [number]
  --phantom      Path to alternative phantom                            [string]
  --help         Show help                                             [boolean]
```

## Benchmark
I compared speed on 500 files.<br/>
**svg2png** vs **svg2png-many**<br/>
**11min** vs **27sec**

```bash
$ time ./node_modules/.bin/svg2png-many -i src res
500 files have been converted successfully
real    0m27.489s
user    0m11.483s
sys     0m7.330s

$ time for f in src/*.svg; do ./node_modules/.bin/svg2png $f; done  
real    11m40.203s
user    5m47.640s
sys     1m45.301s
```
