const { Storage } = require('@google-cloud/storage');
const multer = require('multer');
const util = require('util');
const path = require('path');

// Load service account key
const saKey = path.resolve('');

const bucketName = 'stylosense-backend-bucket';

// Configure Google Cloud Storage
const bucketConfig = new Storage({
    projectId: '',
    keyFilename: saKey,
});

// Configure Multer for handling file uploads with a size limit
const uploadMulter = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
}).single('image');

// Promisify the multer middleware to use it with async/await
const uploadMiddleware = util.promisify(uploadMulter);

module.exports = { bucketConfig, uploadMulter, bucketName, uploadMiddleware };
