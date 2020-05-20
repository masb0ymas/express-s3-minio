import MulterMiddleware from '#helpers/Multer'

const setupMulterDoc = MulterMiddleware.setup(
  {
    destination(req, file, cb) {
      cb(null, './public/uploads/')
    },
  },
  null,
  ['.csv', '.xls', '.jpg', '.png']
)

const multerS3 = setupMulterDoc([{ name: 'dokumen', maxCount: 1 }])

export default multerS3
