[![Node.js CI](https://github.com/Borewit/rate-limit-threshold/actions/workflows/nodejs-ci.yml/badge.svg)](https://github.com/Borewit/rate-limit-threshold/actions/workflows/nodejs-ci.yml)
[![NPM version](https://img.shields.io/npm/v/rate-limit-threshold.svg)](https://npmjs.org/package/rate-limit-threshold)
[![npm downloads](http://img.shields.io/npm/dm/rate-limit-threshold.svg)](https://npmcharts.com/compare/rate-limit-threshold?interval=30&start=365)
[![Coverage Status](https://coveralls.io/repos/github/Borewit/rate-limit-threshold/badge.svg?branch=main)](https://coveralls.io/github/Borewit/rate-limit-threshold?branch=main)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/2bc47b2006454bae8c737991f152e518)](https://www.codacy.com/gh/Borewit/rate-limit-threshold/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Borewit/rate-limit-threshold&amp;utm_campaign=Badge_Grade)
[![CodeQL](https://github.com/Borewit/rate-limit-threshold/actions/workflows/codeql.yml/badge.svg)](https://github.com/Borewit/rate-limit-threshold/actions/workflows/codeql.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/Borewit/rate-limit-threshold/badge.svg?targetFile=package.json)](https://snyk.io/test/github/Borewit/rate-limit-threshold?targetFile=package.json)

# rate-limit-threshold

## Installation

```shell
npm install rate-limit-threshold
```
This package is an ESM package. Your project needs to be ESM too. [Read more](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).

## Usage

A [rate-limit-threshold](https://en.wikipedia.org/wiki/Rate_limiting) which restricts a maximum number of call in a given time frame. 

Example
```js
import {RateLimitThreshold} from 'rate-limit-threshold';

(async () => {
  const rateLimitThreshold = new RateLimitThreshold(3, 1); // Maximum 3 requests in 1 seconds

  for (let n = 0; n < 7; ++n) {
    const delayInMs = await rateLimitThreshold.limit(); // Slow down loop to comply with 20 call in 10 seconds
    console.log('Timeout applied to coply with rate limit', delayInMs);
    // after the limit() is been aplied, you call your limitted requested
  }
})();
```

## API

### RateLimitThreshold

### Constructor

`new RateLimitThreshold(requests, period);`

Arguments:
* `requests`, _number_, Allowed requests within period (window) 
* `period`, _number_, Period (window) in milliseconds

### limit

Call limit before the function you want call no more than `requests` in per `period`.

`const timeSleptInMs await = limit()`

Promise which resolved when timeout (sleep). The time in milliseconds slept is returned. 

## Compatibility 

1.  [Pure ESM package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c)
2.  [ECMAScript 2019](https://262.ecma-international.org/10.0/)
