import 'dotenv/config'

const Minio = require('minio')

const s3Client = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: JSON.parse(process.env.MINIO_PORT),
  useSSL: JSON.parse(process.env.MINIO_SECURITY),
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
})

export default s3Client
