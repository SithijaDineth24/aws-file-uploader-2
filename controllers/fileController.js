const multer = require("multer");
const path = require("path");
const express = require("express");
const sql_db = require("..//MySql_Config/Sql_Connection");
const zipFile = require("../Utilities/Zipper");
const catchAsync = require('./../Utilities/catchAsync');

const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

const aws_s3 = require("./../AWS_Config/s3");


exports.getAllCollections = catchAsync(async (req, res, next) => { //SQL getting all the saved collections  
  const get_collections = `SELECT * FROM filecollections`;
  sql_db.query(get_collections, function (err, result, feilds) {
    if (err) {
      throw err;
    } else {
      res.json({ status: 'success', statusCode: 200, data: result });
    }
  });
});

exports.getCollectionsDetails = catchAsync(async (req, res, next) => {  //SQL getting details of a specific collections  
  const collection_ID = req.body.UUID;
  const get_collection = `SELECT * FROM filecollections WHERE collectionid = (?)`;
  sql_db.query(
    get_collection,
    [collection_ID],
    function (err, result, feilds) {
      if (err) {
        throw err;
      } else {
        res.json({ status: 'success', statusCode: 200, data: result });
      }
    }
  );
});

exports.getCollectionFiles = catchAsync(async (req, res, next) => { //listing all the file keys in a sub directory
  const collection_UDID = req.body.UUID;
  const collectionData = await aws_s3.getCollectionObjects(collection_UDID);

  res.json({ status: 'success', statusCode: 200, data: collectionData });
});

exports.getSignedURl = catchAsync(async (req, res, next) => { //getting signed URL for a specific object
  const key = req.body.key;
  console.log(req.body);
  const url = await aws_s3.getPresignedURl("uniro-ftp-bucket", key);

  res.json({ status: 'success', statusCode: 200, data: url });
});

exports.downloadCompleteCollection = catchAsync(async (req, res, next) => { //getting signed urls for a commplete collection ====> NOT USING
  const collection_UDID = req.body.key;
  const collectionObjs = await aws_s3.getCollectionObjects(collection_UDID);

  let objKeys = collectionObjs.Contents.map((result) => result.Key);

  const signedUrls = await aws_s3.getPresignedURlCollection("uniro-ftp-bucket", objKeys);
  console.log(signedUrls);

  res.json({ status: 'success', statusCode: 200, data: signedUrls });
});

exports.downloadFile = catchAsync(async (req, res, next) => {  //downloding a single file with getObject method  ===>FUNTIONAL BUT NEEDS WORK
  const key = "82917905-4ec1-4ea4-ae14-da8ae5c2e9f1/al_com_acc_01.pdf";
  const readStream = aws_s3.getFileStream(key);

  res.attachment(key);
  readStream.pipe(res);
});

exports.downloadCollection = catchAsync(async (req, res, next) => {  //downloding the complete collection as a zip file
  let fileKey = req.params.key;
  let timestamp = new Date().getTime();
  let fileName = `${timestamp}.zip`;
  let zip = await zipFile(fileKey);
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", "attachment;" + fileName);
  zip.pipe(res);
});

exports.DeleteFile = catchAsync(async (req, res, next) => { //deleting a single file
  const file_key = req.body.key;
  const result = await aws_s3.deleteFilebyId(file_key);

  res.json({ status: 'success', statusCode: 200, data: result });
});

exports.DeleteCollection = catchAsync(async (req, res, next) => { //deleting the complete collection by id
  const file_keys = req.body.keys;
  const collection_key = req.body.collection_key;
  await aws_s3.deleteFileCollection(file_keys).then(() => {

    const delete_collections = `DELETE FROM filecollections WHERE collectionid = (?)`;
    sql_db.query(delete_collections, [collection_key], function (err, result, feilds) {
      if (err) {
        console.log(err);
        throw err;
      } else {
        res.json({ status: 'success', statusCode: 200, data: result });
      }
    });

  });
});

exports.UpdateCollection = catchAsync(async (req, res, next) => { //updating collection by id
  const last_modified = new Date(Date.now()).toLocaleString();
  const { collectionid, topic, category, description } = req.body;

  const update_collection = `UPDATE filecollections SET topic=(?), last_modified=(?), category=(?), description=(?) WHERE collectionid = (?)`;
  sql_db.query(update_collection, [topic, last_modified, category, description, collectionid], function (err, result, feilds) {
    if (err) {
      console.log(err);
      throw err;
    } else {
      res.json({ status: 'success', statusCode: 200, data: result });
    }
  });
});

