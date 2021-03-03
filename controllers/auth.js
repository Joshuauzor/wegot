module.exports = function(app){
    const express = require('express');
    const dotenv = require('dotenv');
    const bcrypt = require('bcryptjs');
    const expressValidator = require('express-validator');
    const mysql = require('mysql');
    const bodyParser = require('body-parser');
    const expressSession = require('express-session');
    const session = require('express-session');
    const Joi = require('joi');


    var urlencodedParser = bodyParser.urlencoded({ extended: false }); //required
    //creating mysql connection 
    //hidding with .env
   //creating mysql connection 
    //hidding with .env
    // const db = mysql.createConnection({
    //     host: process.env.DATABASE_HOST,
    //     user: process.env.DATABASE_USER,
    //     password: process.env.DATABASE_PASSWORD,
    //     database: process.env.DATABASE,
    // });

    const db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '', 
        database: 'wegot',
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
            confirm_pass: Joi.string() .min(5).required().valid(Joi.ref('password'))
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
                return res.redirect('/register')

            };

            let hashedPassword = await bcrypt.hash(password, 8);

            let newUsers = [
                {
                    firstname : firstname,
                    lastname : lastname,
                    email : email,
                    gender : gender,
                    password : hashedPassword
                }
            ];
            // let hashedPassword = await bcrypt.hash(password, 8);
            // console.log(hashedPassword);
            db.query('INSERT INTO user SET ?', newUsers, (err, results) => {
                if(err){
                    throw err;
                }
                else{
                    return res.redirect('/login')
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
                // add session
                return res.status(200).redirect('home');

            }) 
        }
    })
}