
require('../index')({
    name: 'test_name',
    description: 'Test description'
}, pkg => ({
    description: pkg.description,
    env: {
        host: {
            description: 'the Redis host',
            default: 'localhost'
        },
        namespace: {
            description: 'the Redis namespace',
            default: pkg.name
        },
        loggerLevel: {
            description: 'the logger level',
            default: 'info'
        }
    },
    config: env => ({
        inq: {
            description: 'the input queue name',
            default: `${env.namespace}:in:q`
        }
    }),
    defaults: {
        development: {
            loggerLevel: 'debug'
        }
    }
}), context => console.log(context.config, Object.keys(context)));
