import 'dotenv/config'
import createDirNotExist from '#utils/Directory'

const Minio = require('minio')

const {
  MINIO_ENDPOINT,
  MINIO_PORT,
  MINIO_SECURITY,
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY,
  MINIO_REGION,
  MINIO_BUCKET,
} = process.env

const s3Client = new Minio.Client({
  endPoint: MINIO_ENDPOINT,
  port: Number(MINIO_PORT),
  useSSL: MINIO_SECURITY === 'true',
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
  region: MINIO_REGION || 'eu-west-2',
})

console.log(`Initial S3 Bucket [ ${MINIO_BUCKET} ]`)

/* Created Directory */
async function createDirectory(userData) {
  const pathDirectory = ['./public/uploads']
  pathDirectory.map((x) => createDirNotExist(x))
}

/* Check Bucket */
s3Client.bucketExists(MINIO_BUCKET, async function (err, exists) {
  if (err) {
    const errMsg = `Oops!, Bucket exists: ${err}`
    console.log(errMsg)
    throw new Error(errMsg)
  }

  await createDirectory()

  /* Bucket Exists */
  if (exists) {
    console.log(`Bucket [ ${MINIO_BUCKET} ] already exists!`)
  } else {
    try {
      await createDirectory()
      /* Create Bucket */
      s3Client.makeBucket(MINIO_BUCKET, MINIO_REGION || 'eu-west-2', function (err) {
        if (err) {
          const errMsg = `Oops!, Create Bucket: ${err}`
          console.log(errMsg)
          throw new Error(errMsg)
        }

        console.log(`Bucket [ ${MINIO_BUCKET} ] Created Successfully`)
      })
    } catch (err) {
      const errMsg = `Oops!, Create Bucket: ${err}`
      console.log(errMsg)
      throw new Error(errMsg)
    }
    console.log(`Bucket [ ${MINIO_BUCKET} ] Created Successfully`)
  }
})

export default s3Client
