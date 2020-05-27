import 'dotenv/config'
import s3Client from '#config/minio'

const { MINIO_BUCKET } = process.env

async function uploadFile(filename, oriFilename, fileType, tempFilePath) {
  const encodedOriFileName = Buffer.from(oriFilename).toString('base64')
  const filePath = `${filename}`

  const metaData = {
    'content-type': fileType,
    'file-name': encodedOriFileName,
    'X-Amz-Acl': 'public-read',
  }

  console.log(metaData)

  return new Promise((resolve, reject) => {
    s3Client.fPutObject(MINIO_BUCKET, filePath, tempFilePath, metaData, (err, etag) => {
      console.log(err, etag)

      if (err) {
        console.log(err)
        reject(new Error('Oops!, error upload file', err))
      }
      resolve(etag)
    })
  })
}

async function uploadFileSteam(filename, oriFilename, fileType, fileStream) {
  const encodedOriFileName = Buffer.from(oriFilename).toString('base64')
  const filePath = `${filename}`

  const metaData = {
    'content-type': fileType,
    'file-name': encodedOriFileName,
    'X-Amz-Acl': 'public-read',
  }

  console.log(metaData)

  return new Promise((resolve, reject) => {
    s3Client.putObject(MINIO_BUCKET, filePath, fileStream, metaData, (err, etag) => {
      console.log(err, etag)

      if (err) {
        console.log(err)
        reject(new Error('Oops!, error upload file', err))
      }
      resolve(etag)
    })
  })
}

async function listBuckets() {
  return new Promise((resolve, reject) => {
    s3Client.listBuckets((err, data) => {
      if (err) {
        console.log(err)
        reject(new Error('Oops!, Error get list buckets', err))
      }
      resolve(data)
    })
  })
}

async function listFiles() {
  return new Promise((resolve, reject) => {
    const stream = s3Client.listObjects(MINIO_BUCKET, '', true)
    const list = []
    stream.on('data', (obj) => {
      list.push(obj)
    })
    stream.on('error', (err) => {
      reject(err)
    })
    stream.on('end', () => {
      resolve(list)
    })
  })
}

async function getFile(filename, tmpFile, callback) {
  s3Client.fGetObject(MINIO_BUCKET, filename, tmpFile, callback)
}

async function getFileStream(filename, callback) {
  s3Client.getObject(MINIO_BUCKET, filename, callback)
}

async function getFileStat(filename) {
  return new Promise((resolve, reject) => {
    s3Client.statObject(MINIO_BUCKET, filename, (err, stat) => {
      if (err) {
        return reject(err)
      }
      resolve(stat)
    })
  })
}

async function deleteFile(filename, callback) {
  s3Client.removeObject(MINIO_BUCKET, filename, callback)
}

async function getFileMetaData(stat) {
  if (stat && stat.metaData) {
    return {
      filename: Buffer.from(stat.metaData['file-name'], 'base64').toString('utf8'),
      contentType: stat.metaData['content-type'],
    }
  }
  return {}
}

module.exports = {
  listFiles,
  listBuckets,
  uploadFile,
  uploadFileSteam,
  getFile,
  getFileStream,
  getFileStat,
  deleteFile,
  getFileMetaData,
}
