const  sequelize  = require('sequelize');


module.exports = new sequelize('Wegot', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

