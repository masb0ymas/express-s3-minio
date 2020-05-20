import 'dotenv/config'
import minioClient from '#helpers/MinioHelpers'
import { getTempPath } from '#helpers/utils'

async function getAllBuckets(req, res) {
  try {
    await minioClient.listBuckets((err, list) => {
      if (err) {
        return res.status(400).json({ message: err })
      }

      return res.status(200).json({ data: list })
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: 'gagal' })
  }
}

async function getAllStorage(req, res) {
  try {
    await minioClient.listFiles((err, list) => {
      if (err) {
        return res.status(400).json({ message: err })
      }

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
    stat = await minioClient.getFileStat(filename)
  } catch (err) {
    console.log('minio handleGetSteam error: ', err)
    return res.status(400).json({ data: err })
  }
  console.log(stat)

  const tmpFile = getTempPath(filename)
  console.log(tmpFile)

  minioClient.getFile(filename, tmpFile, (err) => {
    if (err) {
      return res.status(400).json({ data: err })
    }
    // eslint-disable-next-line prefer-const
    let dataMeta = minioClient.getFileMetaData(stat)
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

  minioClient.uploadFile(
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

export { getAllBuckets, getAllStorage, getFileStreaming, uploadedFile }
