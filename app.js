const express = require('express');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const expressValidator = require('express-validator');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const session = require('express-session');
const joi = require('joi');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const Nexmo = require('nexmo');
const socketio = require('socket.io');
// const Validator = require('./util/validator'); 

// DECLARATION ENDS
const app = express();
const port = 5000;
// middleware
var urlencodedParser = bodyParser.urlencoded({ extended: false }); //required

app.get('/contact/:name', (req, res) => {
  res.send('Contact World Mr.'+ req.params.name); 
});

app.set('view engine', 'ejs');
// routes 
app.use('/assets', express.static('assets'));
app.use('/', require('./routes/pages'));
app.use('/home', require('./routes/home'));

// controller
var user = require('./controllers/auth'); 
var home = require('./controllers/home'); 


// database 
const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

db.connect((err) => {
  if(err){
    throw err; 
  }
  console.log('Mysql connected to localhost');
});
// database ends 

// using session middleware
// app.use(session({
//   secret: 'We Got',
//   resave: false,
//   saveUninitialized: true,
//   cookie: {
//     secure: true
//   }
// }));

// Node mailer

// ends

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'We Got',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }, 
  // genid: function(req) {
  //   return genuuid() // use UUIDs for session IDs
  // },
}))

user(app);
home(app);

app.listen(port, () => { 
  console.log(`App started at http://localhost:${port}`)
})