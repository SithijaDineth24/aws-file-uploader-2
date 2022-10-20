const AppError = require('./../Utilities/appError');

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.errorMessage,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {

    // Operational, trusted error: send message to client
    if (err.isOperational) {
        console.log(err.errorMessage);

        // res.status(err.statusCode).json({
        //     status: err.status,
        //     message: err.errorMessage
        // });

        res.json({
            status: err.status,
            statusCode: err.statusCode,
            message: err.errorMessage
        });

        // Programming or other unknown error: don't leak error details
    } else {
        // 1) Log error
        console.error('ERROR 💥', err);

        // 2) Send generic message

        // res.status(500).json({
        //     status: 'error',
        //     message: 'Something went very wrong!'
        // });

        res.json({
            status: 'error',
            statusCode:500,
            message: 'An unexpected error occured!'
        });
    }
};

module.exports = (err, req, res, next) => {    

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    err.message = err.message || 'An unexpected error occured!';

    let error = { ...err };

    sendErrorProd(error, res);
};