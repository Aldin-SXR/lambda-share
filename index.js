const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const multer  = require('multer');
const config = require('./config');
const cors = require('cors');

let AWS = require('aws-sdk');
const lambda = new AWS.Lambda({
    accessKeyId: config.AWS_ID,
    secretAccessKey: config.AWS_SECRET,
    region: 'eu-central-1'
});

let storage = multer.memoryStorage({});
let upload = multer({storage: storage}).single('file');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static('app/dist'));
app.use(cors());

app.get('/version', (req, res) => {
    res.json({
        'app_version': '1.0.0'
    });
})

app.post('/upload', upload, (req, res) => {
    let data = JSON.stringify({
        'buffer': req.file.buffer.toString('base64'),
        'name': req.file.originalname,
        'type': req.file.mimetype 
    });

    const LAMBDA_PARAMS = {
        FunctionName: 'upload-to-s3',
        Payload: data
    }

    lambda.invoke(LAMBDA_PARAMS, (error, response) => {
        if (error) {
            console.log(error);
            res.status(400).send('File upload failed.');
        } else {
            res.json(JSON.parse(response.Payload));
        }
    })
});

app.get('/files', (req, res) => {
    let limit = Number(req.query.limit) || 5;
    const LAMBDA_PARAMS = {
        FunctionName: 'list-s3-files',
        Payload: JSON.stringify({ num_files: limit })
    }

    lambda.invoke(LAMBDA_PARAMS, (error, response) => {
        if (error) {
            console.log(error);
            res.status(400).send('File retrieval failed.');
        } else {
            res.json(JSON.parse(response.Payload));
        }
    })
});

app.listen(port, () => {
    console.log(`Express server started on port: ${port}`);
})