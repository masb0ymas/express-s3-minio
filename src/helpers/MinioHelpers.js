import 'dotenv/config'

const Minio = require('minio')

const { MINIO_UPLOADS_FOLDER_NAME, MINIO_BUCKET } = process.env

let s3Client

async function initBucket(s3Client) {
  console.log('Initial S3 Bucket ', MINIO_BUCKET)

  let exists
  try {
    exists = await s3Client.bucketExists(MINIO_BUCKET)
  } catch (err) {
    const errMsg = `initBucket - bucketExists: ${err}`
    console.log(errMsg)
    throw new Error(errMsg)
  }

  if (exists) {
    console.log('initBucket: bucket exists', MINIO_BUCKET)
  } else {
    try {
      await s3Client.makeBucket(
        MINIO_BUCKET,
        process.env.MINIO_REGION || 'eu-west-2'
      )
      console.log('Bucket creatd')
    } catch (err) {
      const errMsg = `initBucket - makeBucket: ${err}`
      console.log(errMsg)
      throw new Error(errMsg)
    }
    console.log('initBucket: bucket created', MINIO_BUCKET)
  }

  return true
}

async function getInstance() {
  if (s3Client) {
    return s3Client
  }

  s3Client = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: Number(process.env.MINIO_PORT),
    useSSL: process.env.MINIO_SECURITY === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
    region: process.env.MINIO_REGION || 'eu-west-2',
  })

  await initBucket(s3Client)
  return s3Client
}

async function uploadFile(
  filename,
  oriFilename,
  fileType,
  tempFilePath,
  callback
) {
  const uploads = MINIO_UPLOADS_FOLDER_NAME
  const filePath = `${uploads}/${filename}`
  const encodedOriFileName = Buffer.from(oriFilename).toString('base64')

  const metaData = {
    'content-type': fileType,
    'file-name': encodedOriFileName,
  }

  const s3Client = await getInstance()
  s3Client.fPutObject(MINIO_BUCKET, filePath, tempFilePath, metaData, callback)
}

async function uploadFileSteam(filename, oriFilename, fileType, fileStream) {
  const uploads = MINIO_UPLOADS_FOLDER_NAME
  const filePath = `${uploads}/${filename}`
  const encodedOriFileName = Buffer.from(oriFilename).toString('base64')

  const metaData = {
    'content-type': fileType,
    'file-name': encodedOriFileName,
  }

  const s3Client = await getInstance()
  return s3Client.putObject(MINIO_BUCKET, filePath, fileStream, metaData)
}

async function listFiles(callback) {
  const uploads = MINIO_UPLOADS_FOLDER_NAME
  const prefix = `${uploads}`

  const s3Client = await getInstance()
  const stream = s3Client.listObjects(MINIO_BUCKET, prefix, true)
  const list = []
  stream.on('data', (obj) => {
    list.push(obj)
  })
  stream.on('error', (err) => {
    callback(err)
  })
  stream.on('end', () => {
    callback(null, list)
  })
}

async function getFile(filename, tmpFile, callback) {
  // const uploads = MINIO_UPLOADS_FOLDER_NAME
  // const objectName = `/tmp/minio/${MINIO_BUCKET}/${filename}`
  const s3Client = await getInstance()
  s3Client.fGetObject(MINIO_BUCKET, filename, tmpFile, callback)
}

async function getFileStream(filename, callback) {
  // const uploads = MINIO_UPLOADS_FOLDER_NAME
  // const objectName = `${uploads}/${fileName}`
  const s3Client = await getInstance()
  s3Client.getObject(MINIO_BUCKET, filename, callback)
}

async function getFileStat(filename) {
  const s3Client = await getInstance()
  return new Promise((resolve, reject) => {
    // const uploads = MINIO_UPLOADS_FOLDER_NAME
    // const objectName = `${uploads}/${filename}`
    s3Client.statObject(MINIO_BUCKET, filename, (err, stat) => {
      if (err) {
        return reject(err)
      }
      resolve(stat)
    })
  })
}

async function deleteFile(fileName) {
  const uploads = MINIO_UPLOADS_FOLDER_NAME
  const objectName = `${uploads}/${fileName}`
  const s3Client = await getInstance()
  try {
    await s3Client.removeObject(MINIO_BUCKET, objectName)
  } catch (err) {
    return err
  }
  return null
}

const getFileMetaData = (stat) => {
  if (stat && stat.metaData) {
    return {
      filename: Buffer.from(stat.metaData['file-name'], 'base64').toString(
        'utf8'
      ),
      contentType: stat.metaData['content-type'],
    }
  }
  return {}
}

module.exports = {
  getInstance,
  uploadFile,
  uploadFileSteam,
  listFiles,
  getFile,
  getFileStream,
  getFileStat,
  deleteFile,
  getFileMetaData,
}
