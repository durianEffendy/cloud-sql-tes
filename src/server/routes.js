const Hapi = require('@hapi/hapi');
const { testHandler, getAllTailorsHandler, getTailorHandler, postTailorHandler } = require('./handler');

const routes = [
    {
        path: '/test',
        method: 'GET',
        handler: testHandler,
    },
    {
        path: '/api/v1/tailors',
        method: 'GET',
        handler: getAllTailorsHandler,
    },
    {
        path: '/api/v1/tailors/{tailorId}',
        method: 'GET',
        handler: getTailorHandler
    },
    {
        path: '/api/v1/tailors/create',
        method: 'POST',
        handler: postTailorHandler,
        options: {
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data',
                multipart: true,
                maxBytes: 5 * 1024 * 1024, // 5MB file size limit
            }
        }
    }
]

module.exports = routes;