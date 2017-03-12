
# redis-app

Redis application archetype.

Named in honour of https://en.wikipedia.org/wiki/Richard_Feynman 

This provides lifecycle boilerplate reused across similar applications.


## Usage

The `index.js` entry-point uses the `redis-app` application archetype.
```javascript
require('redis-app')(
    require('../package'),
    require('./spec'),
    async redisApp => Object.assign(global, redisApp),
    () => require('./main')
).catch(err => {
    console.error(err);
});
```
where we extract the `config` from `process.env` according to the `spec` and invoke our `main` function.

In the above example, we assign the archetype's dependencies on `global` before `main.js` is parsed i.e. including:
```
    const redisApp = {
        assert, clc, lodash, Promise,
        asserta, asserto,
        DataError, StatusError, UrlStatusError,
        redis, client, logger, config,
        multiExecAsync
    };
```

## Uses

- https://github.com/evanx/app-spec

## Used by

Inter alia:
- https://github.com/evanx/scan-expire
- https://github.com/evanx/scan-llen
- https://github.com/evanx/retask
- https://github.com/evanx/refile
- https://github.com/evanx/recopy
- https://github.com/evanx/resplit
- https://github.com/evanx/reimport

<hr>

https://twitter.com/@evanxsummers

