import 'dotenv/config'

const Minio = require('minio')

const s3Client = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: Number(process.env.MINIO_PORT),
  useSSL: process.env.MINIO_SECURITY === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
  region: process.env.MINIO_REGION || 'eu-west-2',
})

export default s3Client
