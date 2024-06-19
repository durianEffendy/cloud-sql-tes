const mysql = require('mysql2/promise');
const { sqlConfig } = require("../connections/cloudSQLConnection");
const { bucketConfig, uploadMulter, bucketName, uploadMiddleware } = require("../connections/bucketConnection");

const testHandler = (request, h) => {
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Server Status</title>
        </head>
        <body>
            <h1>Server is running</h1>
        </body>
        </html>
    `;

    const response = h.response(htmlContent);
    response.type('text/html'); // Set the content type to HTML
    response.code(200); // Set the response code to 200 (OK)
    return response;
}

const getAllTailorsHandler = async (request, h) => {
    try {
        const SQLconnection = await mysql.createConnection(sqlConfig);
        const [tailors] = await SQLconnection.execute('SELECT * FROM tailors');

        const response = h.response({
            status: 'success',
            message: 'Tailors retrieved successfully',
            data: tailors,
        });
        response.code(200);
        return response;
    } catch (error) {
        console.error('Error getting tailors:', error);
        // Handle errors appropriately (e.g., return error message or status code)
        return h.response({ status: 'error', message: 'Failed to retrieve tailors' }).code(500);
    }
}

const getTailorHandler = async (request, h) => {
    const { tailorId } = request.params;
    try {
        const connection = await mysql.createConnection(sqlConfig);
        const [tailors] = await connection.execute('SELECT * FROM tailors WHERE id = ?', [tailorId]);

        // Check if no tailor was found for the provided ID
        if (tailors.length === 0) {
            const notFoundResponse = h.response({
                status: 'error',
                message: 'no Tailor Data!',
            });
            notFoundResponse.code(404);
            return notFoundResponse;
        }

        const response = h.response({
            status: 'success',
            message: 'Tailor retrieved successfully',
            data: tailors,
        });
        response.code(200);
        return response;
    } catch (error) {
        console.error('Error getting tailors:', error);
        // Handle errors appropriately (e.g., return error message or status code)
        return h.response({ status: 'error', message: 'Failed to retrieve tailors' }).code(500);
    }
}

const postTailorHandler = async (request, h) => {
    try {
        const { name, location, description, reviews, delivery } = request.payload;
        const file = request.payload.image;
        if (!file) {
            return h.response({ status: 'error', message: 'No file uploaded' }).code(400);
        }

        // Upload the file to Cloud Storage
        const bucket = bucketConfig.bucket(bucketName);
        const gcsFileName = Date.now() + '-' + file.hapi.filename;
        const fileUpload = bucket.file(gcsFileName);

        await new Promise((resolve, reject) => {
            const stream = fileUpload.createWriteStream({
                metadata: {
                    contentType: file.hapi.headers['content-type'],
                },
            });

            stream.on('error', (err) => {
                console.error('Error uploading to Cloud Storage:', err);
                reject(new Error('Failed to upload image'));
            });

            stream.on('finish', resolve);

            stream.end(file._data);
        });

        const imageUrl = `https://storage.googleapis.com/${bucketName}/${gcsFileName}`;

        //(Optional) Insert the data into the database
        const connection = await mysql.createConnection(sqlConfig);
        await connection.execute(
            'INSERT INTO tailors (name, location, description, reviews, delivery, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [name, location, description, reviews, delivery, imageUrl]
        );

        return h.response({
            status: 'success',
            message: 'Image uploaded successfully',
            imageUrl: imageUrl,
        }).code(201);
    } catch (error) {
        console.error('Error handling request:', error);
        return h.response({ status: 'error', message: 'Failed to handle request' }).code(500);
    }
};

const postOrderHandler = async (request, h) => {
    try {
        const { tailorId, customerName, itemName, totalPrice } = request.payload;
        const file = request.payload.image;
        if (!file) {
            return h.response({ status: 'error', message: 'No file uploaded' }).code(400);
        }

        // Upload the file to Cloud Storage
        const bucket = bucketConfig.bucket(bucketName);
        const gcsFileName = Date.now() + '-' + file.hapi.filename;
        const fileUpload = bucket.file(gcsFileName);
        const orderDate = new Date();

        await new Promise((resolve, reject) => {
            const stream = fileUpload.createWriteStream({
                metadata: {
                    contentType: file.hapi.headers['content-type'],
                },
            });

            stream.on('error', (err) => {
                console.error('Error uploading to Cloud Storage:', err);
                reject(new Error('Failed to upload image'));
            });

            stream.on('finish', resolve);

            stream.end(file._data);
        });

        const imageUrl = `https://storage.googleapis.com/${bucketName}/Orders/${gcsFileName}`;

        //(Optional) Insert the data into the database
        const connection = await mysql.createConnection(sqlConfig);
        await connection.execute(
            'INSERT INTO orders (tailor_id, customer_id, order_date, item_name, total_price, order_status, image_url, finished_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [tailorId, customerName, orderDate, itemName, totalPrice, 0, imageUrl, null]
        );

        return h.response({
            status: 'success',
            message: 'Image uploaded successfully',
            imageUrl: imageUrl,
        }).code(201);
    } catch (error) {
        console.error('Error handling request:', error);
        return h.response({ status: 'error', message: 'Failed to handle request' }).code(500);
    }
};

const getAllOrdersHandler = async (request, h) => {
    const { userId } = request.params;
    try {
        const connection = await mysql.createConnection(sqlConfig);
        const [orders] = await connection.execute('SELECT * FROM orders WHERE customer_id = ?', [userId]);

        // Check if no tailor was found for the provided ID
        if (orders.length === 0) {
            const response = h.response({
                status: 'success',
                message: 'No Orders retrieved successfully'
            });
            response.code(200);
            return response;
        }

        const response = h.response({
            status: 'success',
            message: 'Tailor retrieved successfully',
            data: orders,
        });
        response.code(200);
        return response;
    } catch (error) {
        console.error('Error getting orders:', error);
        // Handle errors appropriately (e.g., return error message or status code)
        return h.response({ status: 'error', message: 'Failed to retrieve orders' }).code(500);
    }
}

module.exports = {
    testHandler, getAllTailorsHandler, getTailorHandler, postTailorHandler, postOrderHandler, getAllOrdersHandler
};