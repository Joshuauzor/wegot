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

module.exports = router;