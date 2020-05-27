import 'dotenv/config'
import fs from 'fs'
import minioClient from '#helpers/MinioHelpers'
import { getTempPath, pathUpload } from '#helpers/utils'

async function getAllBuckets(req, res) {
  try {
    const data = await minioClient.listBuckets()
    return res.status(200).json({ data })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: 'Oops!, Something wrong' })
  }
}

async function getAllStorage(req, res) {
  try {
    const data = await minioClient.listFiles()
    return res.status(200).json({ data })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: 'Oops!, Something wrong' })
  }
}

async function getFileStorage(req, res) {
  const { params } = req
  const { filename } = params

  try {
    const stat = await minioClient.getFileStat(filename)

    const tmpFile = getTempPath(filename)
    const uploadPath = pathUpload(filename)
    console.log(stat, tmpFile, uploadPath)

    await minioClient.getFile(req.params.filename, tmpFile, (err) => {
      if (err) {
        return res.status(400).json({ data: err })
      }

      const metaDataFile = minioClient.getFileMetaData(stat)
      console.log(metaDataFile)

      // eslint-disable-next-line prefer-const
      let { filename, contentType } = minioClient.getFileMetaData(stat)
      if (!filename) {
        filename = req.params.filename
      }
      const data = {
        pathMinio: tmpFile,
        pathUpload: uploadPath,
        originalName: filename,
        contentType,
        contentLength: stat.size,
      }

      return res.status(200).json({ data })
    })
  } catch (err) {
    console.log('Oops, Error Get File', err)
    return res.status(400).json({ data: err })
  }
}

async function getFileStorageStream(req, res) {
  const { params } = req
  const { filename } = params

  try {
    const stat = await minioClient.getFileStat(filename)

    const tmpFile = getTempPath(filename)
    const uploadPath = pathUpload(filename)
    console.log(stat, tmpFile, uploadPath)

    let abc = ''
    await minioClient.getFileStream(req.params.filename, (err, stream) => {
      if (err) {
        return res.status(400).json({ data: err })
      }
      console.log(err, stream)

      stream.on('data', function (obj) {
        abc = Buffer.from(obj, 'utf-8')
        console.log(abc)
      })
      stream.on('end', function () {
        // console.log(`End. Total size = ${abc}`)
      })
      stream.on('error', function (err) {
        console.log(err)
      })

      // const metaDataFile = minioClient.getFileMetaData(stat)
      // console.log(metaDataFile, stream)

      // // eslint-disable-next-line prefer-const
      // let { filename, contentType } = minioClient.getFileMetaData(stat)
      // if (!filename) {
      //   filename = req.params.filename
      // }
      // const data = {
      //   stream,
      //   pathUpload: uploadPath,
      //   originalName: filename,
      //   contentType,
      //   contentLength: stream.headers['content-length'],
      // }

      return res.status(200).json({ data: 'berhasil' })
    })
  } catch (err) {
    console.log('Oops, Error Get File', err)
    return res.status(400).json({ data: err })
  }
}

async function postFile(req, res) {
  const { files } = req
  const rawFileData = { ...files.dokumen[0] }
  // console.log(files, rawFileData)

  try {
    const data = await minioClient.uploadFile(
      rawFileData.filename,
      rawFileData.filename || '',
      rawFileData.mimetype || '',
      rawFileData.path || ''
    )
    return res.status(200).json({
      message: 'Uploaded Succesfully!',
      data: { filename: `${rawFileData.filename}`, etag: data },
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: 'Oops!, Something wrong' })
  }
}

async function postFileStream(req, res) {
  const { files } = req
  const rawFileData = { ...files.dokumen[0] }
  const fileStream = fs.createReadStream(rawFileData.path)
  console.log(files, rawFileData, fileStream)

  try {
    fs.stat(rawFileData.path, async (err, stat) => {
      if (err) {
        console.log(err)
        return res.status(400).json({ message: 'Oops!, Something wrong' })
      }

      const data = await minioClient.uploadFileSteam(
        rawFileData.filename,
        rawFileData.filename || '',
        rawFileData.mimetype || '',
        fileStream
      )
      return res.status(200).json({
        message: 'Uploaded Succesfully!',
        data: { filename: `${rawFileData.filename}`, etag: data },
      })
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: 'Oops!, Something wrong' })
  }
}

async function destroyFile(req, res) {
  const { params } = req
  console.log(params, req)

  const { filename } = params
  try {
    // const tmpFile = getTempPath(filename)
    await minioClient.deleteFile(filename, (err) => {
      if (err) {
        console.log(err)
        return res.status(400).json({ data: err })
      }

      return res.status(200).json({ message: 'Deleted File Successfully' })
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: 'Oops!, Something wrong' })
  }
}

export {
  getAllBuckets,
  getAllStorage,
  getFileStorage,
  getFileStorageStream,
  postFile,
  postFileStream,
  destroyFile,
}
