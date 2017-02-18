
# redis-app-rpf

Redis application archetype.

Named in honour of https://en.wikipedia.org/wiki/Richard_Feynman 

## Usage

The `lib/index.js` entry-point uses the `redis-koa-app-rpf` application archetype.
```
require('redis-app-rpf')(require('./spec'), require('./main'));
```
where we extract the `config` from `process.env` according to the `spec` and invoke our `main` function.

## Used by

https://github.com/evanx/reo

https://github.com/evanx/scan-expire

<hr>

https://twitter.com/@evanxsummers

