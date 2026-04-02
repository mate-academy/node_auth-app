/* eslint-disable */
const jwtService = require('../services/jwt.service.js')
const { ApiError } = require('../controllers/exeptions/api.error');

const errorMiddleware = (error, req, res, next) => {
   if (error instanceof ApiError) {
    return res.status(error.status).send({
        message: error.message,
        errors: error.errors
    })
   }

    res.statusCode = 500;
    res.send({
        message: 'Server error'
    })

   next();
}

module.exports = {
    errorMiddleware
}