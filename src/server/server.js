const Hapi = require('@hapi/hapi');
const routes = require('./routes');

(async () => {
    const server = Hapi.server({
        port: process.env.PORT,
        host: '0.0.0.0',
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    })
    server.route(routes);

    await server.start();
    console.log(`Server start at: ${server.info.uri}`);
})();