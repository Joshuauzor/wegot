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
    const multer = require('multer');
    const path = require('path');
    const Nexmo = require('nexmo');
    const socketio = require('socket.io');
    // const  sequelize  = require('sequelize');
    const dab = require('../connection');
    const Users = require('../models/Users');

    // 
   
    dab.authenticate()
    .then(() => console.log('database connected....'))
    .catch(err => console.log('Error:' + err));

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

    app.post('/upload_profile', verifyToken, urlencodedParser,  (req, res, next) => {
        
        jwt.verify(req.token, process.env.JWT_SECRET_TOKEN, (error, results) => {
            if(error){
                return res.sendStatus(403);
            }
            else{
                let userId = results.user.id;

                upload(req, res, (error) => {
                    if(error){
                        res.json({
                            message: error
                        });
                    } else{
                        if(req.file == undefined){
                            res.json({
                                message: 'Error: No file selected'
                            });
                        }
                        else{
                        //    res.json({
                        //        message: req.file
                        //    });
                           // insert into the database
                    //        let data = [
                    //         {
                    //             'profile_pics' : req.file.path
                    //         }
                    //    ];
    
                        db.query('UPDATE user SET profile_pics = ? WHERE id = ?', [req.file.path, userId], (error, results) => {
                           if(error){
                              return res.status(503).json({
                                   message: error
                               });
                           }else{
                               return res.status(200).json({
                                   message: 'Profile Pics updated'
                               });
                           }
                       });
                           
                        }
                    }
                })
                
                 
                    // insert into the database
                    
                 
            }
        });
    });

    // ---------------------------------------------------------------------

    // init storage engine
    const storage = multer.diskStorage({
        destination: './assets/profile/',
        filename: (req, file, cb) => {
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
    });

    // ---------------------------------------------------------------------

    //init upload 
    const upload = multer({
        storage: storage,
        limits: {
            fileSize: 100000
        },
        fileFilter: (req, file, cb) => {
            checkFileType(file, cb);
        }
    }).single('profile_pics');

    // ---------------------------------------------------------------------

    // check file type
    const checkFileType = (file, cb) => {
        // allowed ext 
        const filetypes = /jpeg|jpg|png|gif/;
        // check ext
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        // check mimetype
        const mimetype = filetypes.test(file.mimetype);

        if(extname && mimetype){
            return cb(null, true);
        } else{
            cb('Error: Images Only!!!')
        }
    }

    // ---------------------------------------------------------------------

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
            next();
        }
        else{
            // forbidded
            return res.sendStatus(403);
        }
    }


    // --------------------------------------------------------------------------------------
    //send text message 

    app.post('/send_sms', urlencodedParser, (req, res, next) => {

        const schema = Joi.object({
            phone: Joi.number().required().min(10),
            message: Joi.string().required()
        });

        const {value, error} = schema.validate(req.body);
        if(error && error.details){
            return res.status(400).json(error);
        }
        else{
            // res.sendStatus(201).
            return res.json({
                message: req.body
            })
        }
    })

    // --------------------------------------------------

    app.get('/all_users', (req, res) => {
        Users.findAll()
        .then(Users => {
            console.log(Users)
            return res.status(200).json({
                success: Users
            });
        })
        .catch( err => console.log(err))
    })
 }