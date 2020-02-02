const AWS = require('aws-sdk');
const config = require('./config');

const BUCKET_NAME = 'file-storage-lambda';
const s3 = new AWS.S3({
    accessKeyId: config.AWS_ID,
    secretAccessKey: config.AWS_SECRET
});

exports.handler = (event, context, callback) => {

    /* Setting up S3 get parameters */
    const S3_PARAMS = {
        Bucket: BUCKET_NAME,
        MaxKeys: event.num_files || 5
    }

    s3.listObjects(S3_PARAMS, function(error, data) {
        if (error) {
            callback(Error(error));
        }

        files = [];
        for (let file of data.Contents) {
            files.push({
                'name': file.Key,
                'created_at': file.LastModified,
                'kb_size': Math.round(file.Size / 1024, 2),
                'file_path': `https://file-storage-lambda.s3.eu-central-1.amazonaws.com/${file.Key}`
            });
        }

       callback(null, {
            status: 200,
            files: files
        });
    });
};