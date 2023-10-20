const isEmpty = require("is-empty");

const globalExceptionHandler = async (err, req, res, next) => {
    console.error('Error ' + err.statusCode + ':  ' + err.message);
    console.log(err.stackTrace);
    res.status(isEmpty(err.statusCode) ? 500 : err.statusCode).json({ message: err.message });
};

module.exports = globalExceptionHandler;
