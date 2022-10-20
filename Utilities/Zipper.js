const archiver = require("archiver");
const Zip = require("archiver/lib/plugins/zip");
const aws_s3_service = require("../AWS_Config/s3");


// let createZipFile = function (fileName) {
//   let zip = new archiver.create("zip");
//   return new Promise(function (resolve, reject) {
//     S3.getObject(
//       { Bucket: process.env.AWS_BUCKET_NAME, Key: fileName },
//       function (err, data) {
//         if (err) {
//           console.log(err);
//           reject(err);
//         } else {
//           zip.append(data.Body, {
//             name: fileName,
//           });
//           zip.finalize();
//           resolve(zip);
//         }
//       }
//     );
//   });
// };
// module.exports = createZipFile;

// let createZipFile = async function (fileName) {
//     let zip = new archiver.create("zip");
//     var finalKeys = [];
//     var fileColllection;
//     const collection_UDID = "82917905-4ec1-4ea4-ae14-da8ae5c2e9f1";
//     return await aws_s3_service
//         .getCollectionObjects(collection_UDID)
//         .then((data) => {
//             let keys = data.Contents.map((result) => result.Key);
//             console.log(keys);

//             return new Promise(function (resolve, reject) {
//                 for (let i = 0; i < keys.length; i++) {
//                     if (i <= keys.length) {
//                         S3.getObject(
//                             { Bucket: process.env.AWS_BUCKET_NAME, Key: keys[i] },
//                             function (err, data) {
//                                 if (err) {
//                                     console.log(err);
//                                     reject(err);
//                                 } else {
//                                     zip.append(data.Body, { name: keys[i] });
//                                 }
//                             }
//                         );
//                     }
//                     if (i == keys.length - 1) {
//                         console.log("CALLED");

//                         setTimeout(() => {
//                             zip.finalize();
//                             resolve(zip);
//                         }, 5000);

//                     }
//                 }
//             });
//         });
// };

let createZipFile = async function (collection_key) {
    let zip = new archiver.create("zip"); //initializing the plugin

    const collection_UDID = collection_key; //getting the colletion key form request parameters
    console.log("zipper : "+collection_UDID);
    return await aws_s3_service
        .getCollectionObjects(collection_UDID) //getting all the file keys inside the collection
        .then((data) => {
            let keys = data.Contents.map((result) => result.Key);

            for (let i = 0; i < keys.length; i++) {
                if (i <= keys.length) {

                    var file = aws_s3_service.getFileStream(keys[i]);
                    zip.append(file, { name: keys[i] });
                    console.log("APPEND");
                }
                if (i == keys.length - 1) {

                    console.log("FINALIZED");
                    zip.finalize(); //finalize the zip file and pass it on
                    return zip;
                }
            }
        });
};

module.exports = createZipFile;
