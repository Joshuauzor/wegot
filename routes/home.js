const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const authn = require('../controllers/auth');
const auth = require('../models/verifyUser');

const router = express.Router();

router.get('/', verifyToken, (req, res) => {
    jwt.verify(req.token, process.env.JWT_SECRET_TOKEN, (error, results) => {
        if(error){
            res.sendStatus(403);
        }
        else{
            res.json({
                message: 'You are in the dashboard',
                results
            })
        }
    });
    // res.render('home/index', {title: 'Dashboard'});
});

// -------------------------------------------------------

// check token for the route
function verifyToken(req, res, next) {
    // get auth header value
    const bearerHeader = req.headers['authorization'];
    // check if bearer is undefined
    if(typeof bearerHeader !== 'undefined'){
        //Split at the space
        const bearer = bearerHeader.split(' ');
        //get token from array
        const bearerToken = bearer[1];
        // set token
        req.token = bearerToken;
        // next middleware
        next()
    }
    else{
        // forbidded
        return res.sendStatus(403);
    }
}

// -----------------------------------------------------

module.exports = router;