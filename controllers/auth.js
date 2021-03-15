module.exports = function(app){
    const express = require('express');
    const dotenv = require('dotenv').config();
    const bcrypt = require('bcryptjs');
    const expressValidator = require('express-validator');
    const mysql = require('mysql');
    const bodyParser = require('body-parser');
    const expressSession = require('express-session');
    const session = require('express-session');
    const Joi = require('joi');
    const nodemailer = require('nodemailer');
    const jwt = require('jsonwebtoken');
    const crypto = require('crypto');


    // const sendMail = require('helper/email_helper');


    var urlencodedParser = bodyParser.urlencoded({ extended: false }); //required
   //creating mysql connection 
    //hidding with .env
    const db = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE, 
    });


    //connecting
    db.connect((err) => {
        if(err){
            throw err;
        }
        console.log('Mysql connected to localhost');
    });
    //ends here


    // ---------------------------------------------------------------------

    app.post('/register', urlencodedParser, (req, res, next) => {
        const schema = Joi.object({ 
            firstname: Joi.string().required().min(4).messages({
                'string.base': `"firstname" should be a type of 'text'`,
                'string.empty': `"firstname" cannot be an empty field`,
                'string.min': `"firstname should have a minimum length of {#limit}`,
                'any.required': `"firstname" is a required`,
              }),
            lastname: Joi.string().required(),
            email: Joi.string().min(6).required().email(),
            gender: Joi.string().required(),
            password: Joi.string().min(5).required(),  
            confirm_pass: Joi.string().min(5).required().valid(Joi.ref('password'))
        });
            
        
        // const validation = schema.validate(req.body);
        const {value, error} = schema.validate(req.body);
        if(error && error.details){
            return res.status(400).json(error);
        }
        // return res.json(value);
        else{
        // add user to db
        // res.send(validation.error);
     
       const { firstname, lastname, email, gender, password, confirm_pass} = req.body;

        db.query('SELECT email FROM user WHERE email = ?', [email], async (err, results) => {
            if(err){
                // throw err; 
                return res.sendStatus(403).json({
                    error: err
                });
            }

            if(results.length > 0){
                // return res.render('auth/register', {
                //     message: 'Email already exists!'
                // })
                // return res.status(400).redirect('/register');
                // res.sendStatus(403);
                return res.status(400).json({
                    message: 'Email already exist'
                });

            };

            let hashedPassword = await bcrypt.hash(password, 8);

            let newUser = [
                {
                    firstname : firstname,
                    lastname : lastname,
                    email : email,
                    gender : gender,
                    password : hashedPassword
                } 
            ];

            db.query('INSERT INTO user SET ?', newUser, (err, results) => {
                if(err){
                    throw err;
                }
                else{
                    // send mail     
                         // create reusable transporter object using the default SMTP transport
                    let transporter = nodemailer.createTransport({
                        // host: "ssl://smtp.gmail.com",
                        // port: 465,
                        service: 'gmail', 
                        //secure: true, // true for 465, false for other ports
                        auth: {
                        user: process.env.EMAIL_USERNAME, // generated ethereal user
                        pass: process.env.EMAIL_PASSWORD, // generated ethereal password
                        },
                    });
                    
                    // send mail with defined transport object
                    let mailOptions = {
                        from: '"Joshua Uzor" <Zealtechnologies10@gmail.com>', // sender address
                        to: req.body.email, // list of receivers
                        subject: "Account Activation", // Subject line
                        html: "<b>Dear"+" "+req.body.firstname+" "+ req.body.lastname +"</b> Please activate your account by clicking on the link below.<a href='google.com'>Click here..</a>  <br> Thanks" // html body 
                    };

                    transporter.sendMail(mailOptions, function (error, data) {
                        if(error){
                            throw error;
                        }
                        else{
                            console.log('Mail sent'); 
                        }
                    });  
                    // end  
                    // return res.status(200).redirect('/login')  
                    return res.status(201).json({
                        message: 'User registered and mail sent'
                    })  

                }
            }); 
        })
        }
    });


    // --------------------------------------------------------------------

    app.post('/login', urlencodedParser, (req, res, next) => {
        const schema = Joi.object({
            email: Joi.string().required().email(),
            password: Joi.string().min(5).required()
        });

        const {value, error} = schema.validate(req.body);
        if(error && error.details){
            return res.status(400).json(error);
        }
        else{
            const {email, password} = req.body;
            db.query('SELECT * FROM user WHERE email = ?', [email], async (error, result) => {
                if(!result || !(await bcrypt.compare(password, result[0].password))){
                    return res.sendStatus(401).json({
                        error: error
                    });
                    // return res.redirect('/login');
                }
                 
                //assign user to the result so we can use in session
                const user = 
                    {
                        id: result[0].id,
                        firstname : result[0].firstname,
                        lastname : result[0].lastname,
                        email : result[0].email,
                        uniid : result[0].uniid,
                        gender : result[0].gender
                    };

                // add session
                // jwt.sign({user}, process.env.JWT_SECRET_TOKEN, (error, token) => {
                    const token = generateAccessToken(user);
                    const refreshToken = jwt.sign({user}, process.env.JWT_REFRESH_TOKEN)
                    // refresh token added
                    refreshTokens.push(refreshToken);
                    // ends
                    res.json({
                        token: token,
                        refreshToken: refreshToken
                    });
                // });
                // session end
                
                // return res.status(200).json({
                //     message: 'welcome to the dashboard'
                // });

            }) 
        }
    });


    function generateAccessToken(user) {
       return jwt.sign({user}, process.env.JWT_SECRET_TOKEN, {expiresIn: '300s'});
    }

    // ------------------------------------------------------------------------

    let refreshTokens = [];

    app.post('/token', urlencodedParser, (req, res, next) => {
        const refreshToken = req.body.token;
        if(refreshToken == null) return res.sendStatus(401);
        if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
        jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN, (error, results) => {
            if(error) return res.sendStatus(403);
            const accessToken = generateAccessToken(results);
            res.json({accessToken});
           
        });
        // res.json({
        //     token: refreshToken
        // });
    })

    // delete
    app.delete('/logout', (req, res) => {
        // console.log(token);
        refreshTokens = refreshTokens.filter(token => token !== req.body.token)
        res.sendStatus(204)
    })
}