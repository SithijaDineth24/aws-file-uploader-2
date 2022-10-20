const mysql = require('mysql');
const AppError = require('./..//Utilities/appError');
require("dotenv").config();

var connection = mysql.createConnection({
    host: process.env.SQL_HOST,
    port: 3306,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE,
});

connection.connect(function (err) {
    if (!!err) {
        console.log(err);
        console.log("error");
    } else {
        console.log("SQL Contection Success!");
    }
});

module.exports = connection;