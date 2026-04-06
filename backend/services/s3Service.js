const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({ region: "us-east-1" }); // Standard AWS Free Tier region

const getUploadUrl = async (fileName) => {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `errands/${Date.now()}-${fileName}`,
  });
  
  return await getSignedUrl(s3, command, { expiresIn: 300 }); // URL lasts 5 mins
};

module.exports = { getUploadUrl };