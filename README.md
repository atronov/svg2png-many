# svg2png-many
NodeJS module and CLI to convert **many** svg files to png rapidly.

Inspired by [svg2png](https://github.com/domenic/svg2png) and [phantomjs-node](https://github.com/amir20/phantomjs-node). Many thanks to them.

The main difference from [svg2png](https://github.com/domenic/svg2png) that it works **much faster** convering many files.
Because of it uses one PhantomJS instenct for many files and opens many web-pages simultaniously.

## Banchmark
I compared speed on 500 files.

**svg2png** vs **svg2png-many**

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
