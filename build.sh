#!/bin/bash
echo "[*] Zipping the files..."
cp -r config.js lambda/; cd lambda; 
zip -r ../built/lambda_file_upload.zip upload.js config.js
zip -r ../built/lambda_file_check.zip check_file.js config.js 
zip -r ../built/lambda_files_get.zip list_files.js config.js 
rm config.js; cd ..
echo "[*] Updating function code..."
aws lambda update-function-code --function-name upload-to-s3 --zip-file fileb://built/lambda_file_upload.zip
aws lambda update-function-code --function-name check-s3-availability --zip-file fileb://built/lambda_file_check.zip
aws lambda update-function-code --function-name list-s3-files --zip-file fileb://built/lambda_files_get.zip