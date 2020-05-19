/* eslint-disable no-use-before-define */
const { isObject } = require('lodash')
const fs = require('fs')
const {
  ResponseError,
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  UnauthorizedError,
} = require('../modules/ResponseError.js')

const WRAPPER_GLOBAL_CONTEXT = {
  ResponseError,
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  UnauthorizedError,
  createParams,
  createQuery,
}

exports.wrapperRequest = (fn) => {
  return async (req, res) => {
    try {
      const context = {
        req,
        ...WRAPPER_GLOBAL_CONTEXT,
      }

      const data = await fn(context)

      if (req.transaction) {
        console.log('Auto commit transaction...')
        await req.transaction.commit()
      }

      return res.status(200).json(isObject(data) ? data : { data })
    } catch (e) {
      cleanMulterFiles(req)

      if (req.transaction) {
        await req.transaction.rollback()
      }

      if (e instanceof ResponseError) {
        console.log('ERROR RESPONSE ERROR!!!')
        return res.status(e.statusCode).json(generateErrorResponseError(e))
      }
      console.log(e)

      /*
			 lebih logic return status code 500 karena error memang tidak dihandle
			 dicontroller
			 */
      return res.status(500).json({ message: e.message })
    }
  }
}

function cleanMulterFiles(req) {
  const { rawUploadedFiles } = req
  if (rawUploadedFiles) {
    const entriesFiles = Object.entries(rawUploadedFiles)
    for (let i = 0; i < entriesFiles.length; i += 1) {
      // eslint-disable-next-line no-unused-vars
      const [field, value] = entriesFiles[i]
      console.log('Removing... ', value.path)
      fs.unlinkSync(value.path)
    }
  }
}

function createParams(obj) {
  return {
    params: obj,
  }
}

function createQuery(obj) {
  return {
    query: obj,
  }
}

function generateErrorResponseError(e) {
  return isObject(e.message) ? e.message : { message: e.message }
}
