const s3Client = require('../utils/aws');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

const uploadToS3 = async file => {
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const command = new PutObjectCommand(params);

  await s3Client.send(command);

  return `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${file.originalname}`;
};

module.exports = { uploadToS3 };
