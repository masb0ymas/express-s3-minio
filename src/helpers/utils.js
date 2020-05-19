const fs = require('fs')
// const { v1: uuidv1 } = require('uuid')
const config = require('config')

const logger = (config && config.logger) || console
const tempDir =
  (config && config.minioTmpDir) || `/tmp/minio/${process.env.MINIO_BUCKET}`

const getTempPath = (filename) => `${tempDir}/${filename}`
// const getTempPathV1 = (filename) => `${tempDir}/${filename}.${uuidv1()}`

const removeFile = (tmpFile) => {
  const regex = new RegExp(`^${tempDir}/`)
  if (!tmpFile || !tmpFile.match(regex)) {
    const errMsg = `Invalid file: ${tmpFile}`
    logger.warn(errMsg)
    throw new Error(errMsg)
  }

  try {
    fs.unlinkSync(tmpFile)
  } catch (err) {
    logger.info(`${tmpFile} not deleted: ${err}`)
  }
}

module.exports = {
  getTempPath,
  removeFile,
}
