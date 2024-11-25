const s3Client = require('../utils/aws');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

const uploadToS3 = async (file, id) => {
  const key = id || file.originalname;
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const command = new PutObjectCommand(params);

  await s3Client.send(command);

  return `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${key}`;
};

module.exports = { uploadToS3 };
