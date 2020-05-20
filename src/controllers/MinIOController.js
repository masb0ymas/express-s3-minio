import 'dotenv/config'
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

      // eslint-disable-next-line prefer-const
      let { filename, contentType } = minioClient.getFileMetaData(stat)
      if (!filename) {
        filename = req.params.filename
      }
      const data = {
        pathTemp: tmpFile,
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

async function uploadedFile(req, res) {
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

export { getAllBuckets, getAllStorage, getFileStorage, uploadedFile, destroyFile }
