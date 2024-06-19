const { testHandler, getAllTailorsHandler, getTailorHandler, postTailorHandler, postOrderHandler, getAllOrdersHandler } = require('./handler');

const routes = [
    {
        path: '/',
        method: 'GET',
        handler: testHandler,
    },
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
    },
    {
        path: '/api/v1/orders/create',
        method: 'POST',
        handler: postOrderHandler,
        options: {
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data',
                multipart: true,
                maxBytes: 5 * 1024 * 1024, // 5MB file size limit
            }
        }
    },
    {
        path: '/api/v1/orders/{userId}',
        method: 'GET',
        handler: getAllOrdersHandler
    }
]

module.exports = routes;