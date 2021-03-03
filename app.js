const express = require('express');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const expressValidator = require('express-validator');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const session = require('express-session');
const joi = require('joi');
// const Validator = require('./util/validator'); 

// DECLARATION ENDS
const app = express();
const port = 3000;
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

var user = require('./controllers/auth');

// database 
const db = mysql.createConnection({
  database: process.env.DATABASE,
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD
});

db.connect((err) => {
  if(err){
    throw err;
  }
  console.log('Mysql connected to localhost');
});
// database ends 

// using session middleware
app.use(session({
  secret: 'We Got',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true
  }
}));

user(app);

app.listen(port, () => {
  console.log(`App started at http://localhost:${port}`)
})