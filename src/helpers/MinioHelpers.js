import 'dotenv/config'
import s3Client from '#config/minio'

const { MINIO_BUCKET } = process.env

async function uploadFile(filename, oriFilename, fileType, tempFilePath, callback) {
  const encodedOriFileName = Buffer.from(oriFilename).toString('base64')

  const metaData = {
    'content-type': fileType,
    'file-name': encodedOriFileName,
  }

  s3Client.fPutObject(MINIO_BUCKET, filename, tempFilePath, metaData, callback)
}

async function uploadFileSteam(filename, oriFilename, fileType, fileStream) {
  const encodedOriFileName = Buffer.from(oriFilename).toString('base64')

  const metaData = {
    'content-type': fileType,
    'file-name': encodedOriFileName,
  }

  return s3Client.putObject(MINIO_BUCKET, filename, fileStream, metaData)
}

async function listBuckets(callback) {
  const data = await s3Client.listBuckets()
  if (!data) {
    throw new Error('Gagal mendapatkan list buckets')
  }
  callback(null, data)
}

async function listFiles(callback) {
  const stream = await s3Client.listObjects(MINIO_BUCKET, '', true)
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

async function deleteFile(filename) {
  try {
    await s3Client.removeObject(MINIO_BUCKET, filename)
  } catch (err) {
    return err
  }
  return null
}

const getFileMetaData = (stat) => {
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
