require("dotenv").config();
const fs = require("fs");
const S3 = require("aws-sdk/clients/s3");
const { Module } = require("module");

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

async function uploadBulkFiles(files, collection_ID) {
  console.log(collection_ID);
  const params = files.map((file) => {
    return {
      Bucket: bucketName,
      Key: `${collection_ID}/${file.originalname}`,
      Body: file.buffer,
    };
  });

  return await Promise.all(params.map((param) => s3.upload(param).promise()));
}

// async function uploadBulkFiles(files, collection_ID) {
//   console.log(collection_ID);
//   const params = files.map((file) => {
//     return {
//       Bucket: bucketName,
//       Key: `${collection_ID}/${file.originalname}`,
//       Body: file.buffer,
//     };
//   });

//   return await Promise.all(
//     params.map((param) => 
//       s3.upload(param).on('httpUploadProgress', function(progress) {
//         let progressPercentage = Math.round(progress.loaded / progress.total * 100);        
//         console.log(progressPercentage);
//       }).promise())
//     );
// }

function getFileStream(fileKey) { //downloading s3 object from getObject() method and returns as a read stream  
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName,
  };

  return s3.getObject(downloadParams).createReadStream();
}

async function getCollectionObjects(collectionID) {
  return new Promise((resolve, reject) => {
    const s3params = {
      Bucket: "uniro-ftp-bucket",
      MaxKeys: 20,
      Delimiter: "/",
      Prefix: `${collectionID}/`,
    };
    s3.listObjectsV2(s3params, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

async function getPresignedURl(bucketName, key) {
  const params = {
    Bucket: bucketName,
    Key: key,    
    ResponseContentDisposition: "attachment",
    Expires : 86400 //day in seconds
  };

  const preSignedURL = await s3.getSignedUrl("getObject", params);
  return preSignedURL;
}

async function getPresignedURlCollection(bucketName, keys) {
  var signedURLS = [];
  for (let i = 0; i < keys.length; i++) {
    if (i <= keys.length) {
      const params = {
        Bucket: bucketName,
        Key: keys[i],
        ResponseContentDisposition: "attachment",
      };

      const preSignedURL = s3.getSignedUrl("getObject", params);
      signedURLS.push(preSignedURL);
    }
    if (i == keys.length - 1) {
      return signedURLS;
    }
  }
}

async function deleteFilebyId(file_key) {
  try {
    return await s3.deleteObject({ Bucket: bucketName, Key: file_key }).promise();
  } catch (error) {
    throw error;
  }
}

var aws = require('aws-sdk');
const s32 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

async function deleteFileCollection(file_keys) {
  const params = {
    Bucket: bucketName,
    Delete: {
      Objects: file_keys
    },
  };

  s3.deleteObjects(params, function (err, data) {
    if (err) {
      console.log(err); // an error occurred
      throw err;
    }
    else {
      console.log(data); // successful response
      return data;
    }
  });
};

module.exports = {
  getPresignedURl,
  getPresignedURlCollection,
  getCollectionObjects,
  uploadBulkFiles,
  getFileStream,
  deleteFilebyId,
  deleteFileCollection
};
