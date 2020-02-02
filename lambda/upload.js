const AWS = require('aws-sdk');
const config = require('./config');
const crypto = require("crypto");
const path = require('path');

/* AWS services */
const BUCKET_NAME = 'file-storage-lambda';
const s3 = new AWS.S3({
    accessKeyId: config.AWS_ID,
    secretAccessKey: config.AWS_SECRET
});

const lambda = new AWS.Lambda({
    accessKeyId: config.AWS_ID,
    secretAccessKey: config.AWS_SECRET,
    region: 'eu-central-1'
});

exports.handler = (event, context, callback) => {
    /* Read content from the file */
    let ts = Date.now();
    let hash = crypto.createHash('sha256').update(event.buffer).digest('hex');
    
    let ext;
    let name;
    if (event.name.includes('.')) {
        ext = event.name.substring(event.name.indexOf('.') + 1); 
        name = hash + '.' + ext;
    } else {
        ext = '';
        name = hash;
    }
    
    /* Check if file already exists (via Lambda function) */
    const LAMBDA_PARAMS = {
        FunctionName: 'check-s3-availability',
        Payload: JSON.stringify({ 'hash': hash, 'ext': ext })   
    };

    lambda.invoke(LAMBDA_PARAMS, (error, response) => {
        if (error) {
            callback(Error(error));
        } else {
            let res = JSON.parse(response.Payload);
            if (res.file_exists) {
                callback(null, res);
            } else {
                /* Setting up S3 upload parameters */
                const S3_PARAMS = {
                    Bucket: BUCKET_NAME,
                    Key: name,
                    Body: new Buffer(event.buffer, 'base64'),
                    Metadata: {
                        'original_name': event.name,
                        'uploaded_by': 'anonymous',
                        'created_at': new Date().toLocaleString()
                    },
                    ContentType: event.type
                }

                /* Uploading files to the bucket */
                s3.putObject(S3_PARAMS, function(error, data) {
                    if (error) {
                        callback(Error(error))
                    }
                    console.log(`File uploaded successfully at: ${data.Location}`);
                    callback(null, {
                            status: 200,
                            file_path: `https://file-storage-lambda.s3.eu-central-1.amazonaws.com/${name}`,
                            created_at: ts
                        });
                });
            }
        }
    })
};