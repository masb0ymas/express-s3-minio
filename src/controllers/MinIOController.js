import 'dotenv/config'
import fs from 'fs'
import s3Client from '../config/minio'

const {
  getFileStat,
  getFile,
  getFileStream,
  uploadFile,
  getFileMetaData,
} = require('../helpers/MinioHelpers')
const { getTempPath } = require('../helpers/utils')

const { MINIO_REGION, MINIO_BUCKET } = process.env

async function getAllBuckets(req, res) {
  try {
    const data = await s3Client.listBuckets()
    if (!data) {
      throw new Error('Gagal mendapatkan list buckets')
    }
    return res.status(200).json({ buckets: data })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: 'gagal' })
  }
}

async function getAllStorage(req, res) {
  try {
    const dataStream = s3Client.listObjects(MINIO_BUCKET, '', true)
    const list = []
    dataStream.on('data', (obj) => {
      list.push(obj)
    })
    dataStream.on('error', (err) => {
      return res.status(400).json({ message: err })
    })
    dataStream.on('end', () => {
      return res.status(200).json({ data: list })
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: 'gagal' })
  }
}

async function getFileStreaming(req, res) {
  const { params } = req
  const { filename } = params
  let stat
  try {
    stat = await getFileStat(filename)
  } catch (err) {
    console.log('minio handleGetSteam error: ', err)
    return res.status(400).json({ data: err })
  }
  console.log(stat)

  const tmpFile = getTempPath(filename)
  console.log(tmpFile)

  getFile(filename, tmpFile, (err) => {
    if (err) {
      return res.status(400).json({ data: err })
    }
    // eslint-disable-next-line prefer-const
    let dataMeta = getFileMetaData(stat)
    // let { filename, contentType } = getFileMetaData(stat)
    console.log(dataMeta)
  })
  // getFileStream(filename, (err, stream) => {
  //   if (err) {
  //     return res.status(400).json({ data: err })
  //   }
  //   // eslint-disable-next-line prefer-const
  //   let { filename, contentType } = getFileMetaData(stat)
  //   console.log(filename, contentType)
  // })

  // getFileStream(req.params.filename, (err, stream) => {
  //   if (!filename) {
  //     filename = req.params.filename
  //   }
  //   const data = {
  //     stream,
  //     originalName: filename,
  //     contentLength: stream.headers['content-length'],
  //     contentType,
  //   }
  //   return res.status(200).json({ data })
  // })
}

async function uploadedFile(req, res) {
  const { files } = req
  const rawFileData = { ...files.dokumen[0] }
  console.log(files, rawFileData)

  uploadFile(
    rawFileData.filename,
    rawFileData.filename || '',
    rawFileData.mimetype || '',
    rawFileData.path || '',
    (err, etag) => {
      if (err) {
        return res.status(400).json({ message: err })
      }
      return res.status(200).json({
        message: 'berhasil',
        data: { filename: `${rawFileData.filename}`, etag },
      })
    }
  )
}

async function createBucket(req, res) {
  const { body } = req
  const { namaBucket } = body
  try {
    const data = await s3Client.makeBucket(namaBucket, process.env.MINIO_REGION)
    return res
      .status(200)
      .json({ message: 'berhasil membuat bucket', bucket: data })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: 'gagal' })
  }
}

export {
  getAllBuckets,
  getAllStorage,
  createBucket,
  getFileStreaming,
  uploadedFile,
}
