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

    // const sendMail = require('helper/email_helper');


    var urlencodedParser = bodyParser.urlencoded({ extended: false }); //required
    //creating mysql connection 
    //hidding with .env
   //creating mysql connection 
    //hidding with .env
    const db = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE, 
    });

    // const db = mysql.createConnection({
    //     host: 'localhost',
    //     user: 'root',
    //     password: '', 
    //     database: 'wegot',
    // });

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
                throw err; 
            }

            if(results.length > 0){
                // return res.render('auth/register', {
                //     message: 'Email already exists!'
                // })
                return res.status(400).redirect('/register');
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
                        user: 'Zealtechnologies10@gmail.com', // generated ethereal user
                        pass: 'Zealtechnologies21', // generated ethereal password
                        },
                    });
                    
                    // send mail with defined transport object
                    let mailOptions = {
                        from: '"Joshua Uzor 👻" <Zealtechnologies10@gmail.com>', // sender address
                        to: req.body.email, // list of receivers
                        subject: "Account Activation", // Subject line
                        html: "<b>Dear"+ req.body.firstname+" "+ req.body.lastname +"</b> Please activate your account by clicking on the link below.<a href='google.com'>Click here..</a>  <br> Thanks" // html body 
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
                    return res.status(200).redirect('/login')  
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
                    return res.status(401).json(error);
                    // return res.redirect('/login');
                }
                 
                //assign user to the result
                const user = [
                    {
                        firstname : result[0].firstname,
                        lastname : result[0].lastname,
                        email : result[0].email,
                        uniid : result[0].uniid,
                        gender : result[0].gender

                    }
                ];


                // console.log(user);
                // add session
                jwt.sign({user}, 'mysecretkey', (error, token) => {
                    res.json({
                        token
                    });
                });
                // session end
                
                // return res.status(200).redirect('/home');

            }) 
        }
    });


    // ------------------------------------------------------------------------
}