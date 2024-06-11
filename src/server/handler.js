const mysql = require('mysql2/promise');
const { sqlConfig } = require("../connections/cloudSQLConnection");
const { bucketConfig, uploadMulter, bucketName, uploadMiddleware } = require("../connections/bucketConnection");

const testHandler = (request, h) => {
    const response = h.response({
        status: 'success',
        message: 'Berhasil terhubung',
    });
    response.code(200);
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

module.exports = {
    testHandler, getAllTailorsHandler, getTailorHandler, postTailorHandler
};