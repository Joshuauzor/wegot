    const  sequelize  = require('sequelize');
    const dab = require('../connection');

    const Users = dab.define('Users',{
        firstname: {
            type: sequelize.STRING
        },
        lastname: {
            type: sequelize.STRING
        },
        email: {
            type: sequelize.STRING
        },
        uniid: {
            type: sequelize.STRING
        },
        gender: {
            type: sequelize.STRING
        },
        profile_pics: {
            type: sequelize.STRING
        },
        password: {
            type: sequelize.STRING
        },
    });

    Users.sync({false: true})

    module.exports = Users;