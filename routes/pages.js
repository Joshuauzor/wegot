const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('auth/login', {title: 'Login - We Got'});
});

router.get('/login', (req, res) => {
    res.render('auth/login', {title: 'Login - We Got'});
});

router.get('/register', (req, res) => {
    res.render('auth/register', {title: 'Register - We Got', message:''});
});

router.get('/forgot_pass', (req, res) => {
    res.render('auth/forgot_pass', {title: 'Forgot Password - We Got'});
});

// router.get('/logout',  (req, res) => {
//     res.cookie('jwt', '', {maxAge: 1});

//     // destroy
//     // // get auth header value
//     // const bearerHeader = req.headers['authorization'];
//     // // check if bearer is undefined
//     // if(typeof bearerHeader !== 'undefined'){
//     //     //Split at the space
//     //     const bearer = bearerHeader.split(' ');
//     //     //get token from array
//     //     const bearerToken = bearer[1];
//     //     // set token
//     //     req.token = 'bearerToken';
//     //     // next middleware
//     // }
//     // destroy end
//     res.status(200).json({
//         message: 'You are logged out'
//     })
// })

module.exports = router;