const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");
const sql_db = require("..//MySql_Config/Sql_Connection");
const { v4: uuidv4 } = require("uuid");

const multer = require("multer");
const path = require("path");

const aws_Service = require("./../AWS_Config/s3");

//local file deleting after the upload
const fs = require("fs");
const util = require("util");
const { throws } = require("assert");
const unlinkFile = util.promisify(fs.unlink);

const storage = multer.memoryStorage();
const upload = multer({ storage });

const axios = require('axios').default;

router.get("/images/:key", (req, res) => {
  const key = req.params.key;
  const readStream = aws_Service.getFileStream(key);

  // res.attachment(req.params.key);
  readStream.pipe(res);
});

router.post("/uploadfiles", upload.array("images"), async (req, res) => {
  console.log('called2');
  try {
    let { topic, description, category } = req.body;
    const collection_ID = uuidv4();
    const last_modified = new Date(Date.now()).toLocaleString();

    const awsResult = await (await aws_Service.uploadBulkFiles(req.files, collection_ID));

    console.log(awsResult);
    const create_Collection = `Insert Into filecollections (collectionid, topic,last_modified, category, description) VALUES (?,?, ?, ?, ?)`;
    sql_db.query(
      create_Collection,
      [collection_ID, topic, last_modified, category, description],
      function (err, result, feilds) {
        if (err) {
          throw err;
        } else {
          res.json({ status: 'success', statusCode: 200, data: result });
          // Promise.all(
          //   awsResult.map((param) => {
          //     const aws_FileKey = param.key || param.Key;
          //     const record_uploadedFiles = `INSERT INTO fileuploads (collectionid, filekey) VALUES (?,?)`;
          //     sql_db.query(
          //       record_uploadedFiles,
          //       [collection_ID, aws_FileKey],
          //       function (err, result, feilds) {
          //         if (err) {
          //           throw err;
          //         }
          //       }
          //     );
          //   })
          // ).finally(() => {
          //   res.send({ status: 200, data: awsResult });
          // });
        }
      }
    );
  } catch (error) {
    res.send({ status: 0, data: error });
  }
});

router.route("/getAllCollections").get(fileController.getAllCollections);

router.route("/get-collection-details").post(fileController.getCollectionsDetails);

router.route("/get-signed-url").post(fileController.getSignedURl);


router.route("/get-collection-objects").post(fileController.getCollectionFiles);

router.route("/download-collection").post(fileController.downloadCompleteCollection); //NOT USING YET ===>NOT STANDERTS

router.route("/download-compressed-collection/:key").get(fileController.downloadCollection);

router.route("/delete-file").post(fileController.DeleteFile);

router.route("/delete-collection").post(fileController.DeleteCollection);

router.route("/update-collection").post(fileController.UpdateCollection);



module.exports = router;
