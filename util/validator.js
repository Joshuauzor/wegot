//const joi = require('joi');
// const Joi = require('@hapi/joi')
const Joi = require('joi');


module.exports = (schema) => {
    return (req, res, next)=> {
        const {error, value} = schema.validate(req.body);
        // console.log(error)
        if(error){
            return res.status(500).json({message: error.details[0].message.replace(new RegExp('\"','ig'),'')})
        }else{
            next();
        }
    }
}