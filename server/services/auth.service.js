/* jshint esversion: 6 */

const compose = require('composable-middleware');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const env = process.env.NODE_ENV || 'development';
const secret = require('../config/config')[env]['secret'];
const models = require('../models/');
const validateJwt = expressJwt({
        secret,
    });

module.exports = {
    signToken: (data, expiry) => jwt.sign(data, secret, { algorithm: 'HS256', expiresIn: expiry }),
    verifyToken: (data) => jwt.verify(data, secret),
    isAuthenticated: () => 
        compose()
        .use((req, res, next) => {
            // so access_token as well can be passed through query parameter
            if (req.query && req.query.hasOwnProperty('access_token')) {
                req.headers.authorization = 'Bearer ' + req.query.access_token;
            }
            validateJwt(req, res, next);
        })
        .use((req, res, next) => {
            models.User.findById(req.user.userId)
            .then(user => {
                if(!user) return res.status(401).end();
                req.user = user;
                next();
            })
            .catch(err => next(err));
        })
};