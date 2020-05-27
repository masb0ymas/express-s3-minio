import express from 'express'
import { Router as UnoRouter } from 'uno-api'
import multerS3 from '../middleware/multerS3'

const router = express.Router()
const apiPublic = new UnoRouter(router)

/* Declare Controllers */
const MinIOController = require('#controllers/MinIOController')

apiPublic.create({
  baseURL: '/bucket',
  get: MinIOController.getAllBuckets,
  // getWithParam: [['bucket', MinIOController.getBucket]],
})

apiPublic.create({
  baseURL: '/storage',
  get: MinIOController.getAllStorage,
  getWithParam: [
    ['stream/:filename', MinIOController.getFileStorageStream],
    [':filename', MinIOController.getFileStorage],
  ],
  post: {
    middleware: multerS3,
    callback: MinIOController.postFile,
  },
  postWithParam: [['stream', multerS3, MinIOController.postFileStream]],
  delete: MinIOController.destroyFile,
})

module.exports = router
