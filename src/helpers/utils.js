const fs = require('fs')

const tempMinioDir = `/tmp/minio/${process.env.MINIO_BUCKET}`

const getTempPath = (filename) => `${tempMinioDir}/${filename}`
const pathUpload = (filename) => `/uploads/${filename}`

const removeFile = (tmpFile) => {
  const regex = new RegExp(`^${tempMinioDir}/`)
  if (!tmpFile || !tmpFile.match(regex)) {
    const errMsg = `Invalid file: ${tmpFile}`
    console.log(errMsg)
    throw new Error(errMsg)
  }

  try {
    fs.unlinkSync(tmpFile)
  } catch (err) {
    console.log(`${tmpFile} not deleted: ${err}`)
  }
}

module.exports = {
  getTempPath,
  pathUpload,
  removeFile,
}
