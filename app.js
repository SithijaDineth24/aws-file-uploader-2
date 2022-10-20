const express = require("express");
const app = express();
const cors = require("cors");
const fileRouter = require("./routes/fileTranfer");
const settingsRouter = require("./routes/settings");
const multer = require("multer"); 
const path = require("path");

const AppError = require('./Utilities/appError');
const globalErrorHandler = require('./controllers/errorController');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

//main route handler
app.use('/files', fileRouter);
app.use('/settings', settingsRouter);

app.get('/check',(req, res, next) =>{
    res.send("connected!");
});


app.all('*', (req, res, next) => {
    next(new AppError(`Can't find endpoint ${req.originalUrl} on the server!`, 404));
});

app.use(globalErrorHandler);



module.exports = app;
