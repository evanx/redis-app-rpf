
# redis-app-rpf

Redis application archetype.

Named in honour of https://en.wikipedia.org/wiki/Richard_Feynman 

## Usage

The `index.js` entry-point uses the `redis-app-rpf` application archetype.
```
require('redis-app-rpf')(require('./spec'), require('./main'));
```
where we extract the `config` from `process.env` according to the `spec` and invoke our `main` function.

## Uses

- https://github.com/evanx/app-spec

## Used by

- https://github.com/evanx/re8
- https://github.com/evanx/retask
- https://github.com/evanx/scan-expire

<hr>

https://twitter.com/@evanxsummers

