import express from 'express'
import { Router as UnoRouter } from 'uno-api'

const router = express.Router()
const apiPublic = new UnoRouter(router)

/* Declare Controllers */
const MinIOController = require('../controllers/MinIOController')

apiPublic.create({
  baseURL: '/test',
  get: MinIOController.getStorage,
})

module.exports = router
