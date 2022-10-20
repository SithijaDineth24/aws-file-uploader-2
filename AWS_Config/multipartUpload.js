import AWS from 'aws-sdk'
import cuid from 'cuid'
import Axios from 'axios'

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

async function initiateMultipartUpload(fileKey) {
    const s3 = new AWS.S3({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        sessionToken: `session-${cuid()}`
    })

    const params = {
        Bucket: bucketName,
        Key: OBJECT_NAME
    }

    const res = await s3.createMultipartUpload(params).promise()

    return res.UploadId
}

async function generatePresignedUrlsParts(s3, uploadId, parts) {
    const baseParams = {
        Bucket: bucketName,
        Key: OBJECT_NAME,
        UploadId: uploadId
    }

    const promises = []

    for (let index = 0; index < parts; index++) {
        promises.push(
            s3.getSignedUrlPromise('uploadPart', {
                ...baseParams,
                PartNumber: index + 1
            }))
    }

    const res = await Promise.all(promises)

    // return res.reduce((map, part, index) => {
    //     map[index] = part
    //     return map
    // }, {} as Record<number, string>)
}


const FILE_CHUNK_SIZE = 10_000_000

async function uploadParts(file, urls) {
    const axios = Axios.create()
    delete axios.defaults.headers.put['Content-Type']

    const keys = Object.keys(urls)
    const promises = []

    for (const indexStr of keys) {
        const index = parseInt(indexStr)
        const start = index * FILE_CHUNK_SIZE
        const end = (index + 1) * FILE_CHUNK_SIZE
        const blob = index < keys.length
            ? file.slice(start, end)
            : file.slice(start)

        promises.push(axios.put(urls[index], blob))
    }

    const resParts = await Promise.all(promises)

    return resParts.map((part, index) => ({
        ETag: headers.etag,
        PartNumber: index + 1
    }))
}



async function completeMultiUpload(uploadId, parts) {
    const s3 = new AWS.S3({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        sessionToken: `session-${cuid()}`
    })

    const params = {
        Bucket: bucketName,
        Key: OBJECT_NAME,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts }
    }

    await s3.completeMultipartUpload(params).promise()
}