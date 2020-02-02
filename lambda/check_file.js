const AWS = require('aws-sdk');
const config = require('./config');

const BUCKET_NAME = 'file-storage-lambda';
const s3 = new AWS.S3({
    accessKeyId: config.AWS_ID,
    secretAccessKey: config.AWS_SECRET
});

exports.handler = (event, context, callback) => {
    let hash = event.hash;
    let ext = event.ext;
    let name;

    if (ext !== '') { // handle files without extensions
        name = hash + '.' + ext;
    } else {
        name = hash;
    }

    /* Setting up S3 upload parameters */
    const S3_PARAMS = {
        Bucket: BUCKET_NAME,
        Key: name
    }

    /* Checking if the file is in the bucket */
    s3.getObject(S3_PARAMS, function(error, data) {
        if (error) {
            if (error.message === 'The specified key does not exist.') {
                callback(null, { status: 200, file_exists: false });
            } else {
                callback(Error(error));
            }  
        }
        console.log(data);
        callback(null, { // file is found
            status: 200,
            file_exists: true,
            file_path: `https://file-storage-lambda.s3.eu-central-1.amazonaws.com/${name}`,
            file: {
                original_name: data.Metadata.original_name,
                uploaded_by: data.Metadata.uploaded_by,
                hash: hash,
                created_at: data.Metadata.created_at,
                content_type: data.ContentType,
                kb_size: Math.round(data.ContentLength / 1024, 2)
            }
        });
    });
};