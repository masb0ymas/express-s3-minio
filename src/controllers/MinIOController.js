import s3Client from '../config/minio'

async function getStorage(req, res) {
  try {
    s3Client.listBuckets(function (e, buckets) {
      if (e) return console.log(e)
      // console.log('buckets :', buckets)
      return res.status(200).json({ buckets })
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: 'gagal' })
  }
}

module.exports = { getStorage }
