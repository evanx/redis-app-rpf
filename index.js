
const assert = require('assert');
const lodash = require('lodash');
const redis = require('redis');
const bluebird = require('bluebird');
const clc = require('cli-color');
const multiExecAsync = require('multi-exec-async');
const redisLogger = require('redis-logger-rpf');
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
    this.message = message;
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

function asserto(object) {
    const key = Object.keys(object).find(key => !object[key]);
    if (key) {
        throw new DataError('Missing', {key});
    }
}

module.exports = async (pkg, spec, main) => {
    const ends = [];
    const end = code => Promise.all(ends.map(end => {
        end().catch(err => console.error('end', err.message));
    })).then(() => process.exit(code));
    try {
        const config = appSpec(pkg, spec);
        const client = redis.createClient({
            host: config.redisHost || config.host,
            port: config.redisPort || config.port,
            password: config.redisPassword || config.password
        });
        ends.push(() => new Promise(() => client.end(false)));
        const logger = redisLogger(config, redis);
        logger.level = config.loggerLevel;
        await main({
            assert, clc, lodash, Promise,
            asserta, asserto,
            DataError, StatusError,
            redis, client, logger, config, ends,
            multiExecAsync
        });
        end(0);
    } catch (err) {
        console.error();
        console.error(clc.red.bold(err.message));
        if (err.data) {
            console.error(clc.yellow(JSON.stringify(err.data, null, 2)));
        }
        console.error();
        console.error(err);
        end(1);
    }
};
