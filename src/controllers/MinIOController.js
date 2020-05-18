import s3Client from '../config/minio'

async function getStorage(req, res) {
  try {
    const { query } = req
    const { bucket } = query

    const objStream = s3Client.listObjects(bucket, '', true)
    objStream.on('data', function (obj) {
      console.log(obj)
      return res.status(200).json({ data: obj })
    })
    objStream.on('error', function (err) {
      console.log(err)
      return res.status(400).json({ data: err })
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: 'gagal' })
  }
}

async function getObjectStorage(req, res) {
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

async function getBucket(req, res) {
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

module.exports = { getStorage, getObjectStorage, getBucket }
