import express from 'express'
import PublicRoute from './public'

const router = express.Router()

/* Home Page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express',
    description: 'Powered by Nusantech',
  })
})

/* Forbidden Page. */
router.get('/v1', function (req, res, next) {
  res.render('index', {
    title: 'Hayo Mau ngapain ??',
    description: 'Forbidden Access',
    code: '403',
  })
})

router.use('/v1', PublicRoute)

/* Not Found Page. */
router.get('*', function (req, res, next) {
  res.render('index', {
    title: 'Oops, Halaman tidak ditemukan!',
    description: 'Not Found',
    code: '404',
  })
})

module.exports = router
