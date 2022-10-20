const express = require("express");
const sql_db = require("..//MySql_Config/Sql_Connection");
const { v4: uuidv4 } = require("uuid");
const catchAsync = require('./../Utilities/catchAsync');

// local_collaction = "latin1_swedish_ci";

exports.addCategory = catchAsync(async (req, res, next) => {
    var category = req.body.category;
    console.log(category);
    const category_ID = uuidv4();

    const check_category = "SELECT * FROM `collection-categories` WHERE `category` collate utf8mb4_0900_ai_ci like (?)"
    sql_db.query(
        check_category,
        [category],
        function (err, result, feilds) {
            if (err) {
                throw err;
            } else {
                if (result.length == 0) {
                    const add_category = "Insert Into `collection-categories` (categoryid, category) VALUES (?, ?)";
                    sql_db.query(
                        add_category,
                        [category_ID, category],
                        function (err, result, feilds) {
                            if (err) {
                                throw err;
                            } else {

                                res.json({
                                    status: 'success',
                                    statusCode: 200,
                                    data: result
                                });

                            }
                        }
                    );
                } else {

                    res.json({
                        status: 'fail',
                        statusCode: 403,
                        message: "Unable to add new category. Category already exist!"
                    });

                }
            }
        }
    );
});

exports.getAllCategories = catchAsync(async (req, res, next) => {
    const get_categories = 'SELECT * FROM `collection-categories` ORDER BY id DESC';
    sql_db.query(
        get_categories,
        function (err, result, feilds) {
            if (err) {
                throw err;
            } else {
                res.json({ status: 'success', statusCode: 200, data: result });
            }
        }
    );
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
    const category = req.body.category;

    // console.log(abc);

    const check_category = "SELECT * FROM `filecollections` WHERE `category` collate latin1_swedish_ci like (?)"
    sql_db.query(
        check_category,
        [category],
        function (err, result, feilds) {
            if (err) {
                throw err;
            } else {
                console.log(result.length);
                const col_number = result.length;
                if (result.length == 0) {
                    const delete_category = 'DELETE FROM `collection-categories` WHERE `category` = (?)';
                    sql_db.query(
                        delete_category,
                        [category],
                        function (err, result, feilds) {
                            if (err) {
                                throw err;
                            } else {

                                res.json({
                                    status: 'success',
                                    statusCode: 200,
                                    data: result
                                });

                            }
                        }
                    );
                } else {

                    res.json({
                        status: 'fail',
                        statusCode: 403,
                        message: `Unable to Complete action. Category already exist in ${col_number} collections.`
                    });

                }
            }
        }
    );
});

