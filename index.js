
const assert = require('assert');
const lodash = require('lodash');
const redis = require('redis');
const bluebird = require('bluebird');
const clc = require('cli-color');
const multiExecAsync = require('multi-exec-async');
const redisLogger = require('redis-logger-rpf');
const reduceKeys = require('reduce-keys');
const mapProperties = require('map-properties');
const appSpec = require('app-spec');
const Promise = bluebird;

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

function DataError(message, data) {
    this.name = 'DataError';
    this.message = message;
    this.data = data;
    this.constructor.prototype.__proto__ = Error.prototype;
    Error.captureStackTrace(this, this.constructor);
}

function StatusError(message, statusCode, data) {
    this.name = 'StatusError';
    this.message = message || `Status ${statusCode}`;
    this.statusCode = statusCode;
    this.data = data;
    this.constructor.prototype.__proto__ = Error.prototype;
    Error.captureStackTrace(this, this.constructor);
}

function UrlStatusError(url, statusCode, data) {
    this.name = 'UrlStatusError';
    this.message = `Status ${statusCode} for URL ${url}`;
    this.statusCode = statusCode;
    this.data = data;
    this.constructor.prototype.__proto__ = Error.prototype;
    Error.captureStackTrace(this, this.constructor);
}

function asserta(actual, expected) {
    if (actual !== expected) {
        throw new DataError('Unexpected', {actual, expected});
    }
}

function asserto(object, data) {
    const key = Object.keys(object).find(key => !object[key]);
    if (key) {
        throw new DataError('Missing ' + key, data);
    }
}

const printError = err => {
    console.error();
    console.error(clc.red.bold(err.message));
    if (err.data) {
        console.error(clc.yellow(JSON.stringify(err.data, null, 2)));
    } else {
        console.error();
        console.error(err.stack);
    }
};

const exits = [];

const exitCode = code => Promise.all(exits.map(exit => {
    exit()
    .catch(
        err => console.error('exit', err.message)
    );
}))
.then(() => process.exit(code));

const exitApplication = err => {
    if (!err) {
        exitCode(0);
    } else {
        printError(err);
        exitCode(1);
    }
};

const mapRedisK = (spec, config) => {
    assert(typeof spec.redisK === 'function', 'redisK function');
    const redisK = spec.redisK(config);
    const invalidKeys = Object.keys(redisK).filter(key => redisK[key].key === undefined);
    if (invalidKeys.length) {
        throw new DataError('Redis key spec', {invalidKeys});
    }
    return mapProperties(
        redisK,
        meta =>
        typeof meta.key === 'string' && meta.key[0] === ':' ?
        config.redisNamespace + meta.key :
        meta.key
    );
}

module.exports = async (pkg, specf, main) => {
    try {
        const spec = specf(pkg);
        const config = appSpec(pkg, specf);
        const client = redis.createClient({
            host: config.redisHost || config.host,
            port: config.redisPort || config.port,
            password: config.redisPassword || config.password
        });
        exits.push(() => new Promise(() => client.end(false)));
        const logger = redisLogger(config, redis);
        logger.level = config.loggerLevel;
        logger.info({config});
        const redisApp = {
            assert, clc, lodash, Promise,
            asserta, asserto,
            DataError, StatusError, UrlStatusError,
            redis, client, logger, config,
            multiExecAsync
        };
        if (spec.redisK) {
            redisApp.redisK = mapRedisK(spec, config);
        }
        Object.assign(global, {redisApp}, redisApp);
        await main()();
        exitApplication();
    } catch (err) {
        exitApplication(err);
    }
};
