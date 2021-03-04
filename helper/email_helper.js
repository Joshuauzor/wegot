module.exports = class email {
// async with await
 static async sendMail(receiversMail, receiversName){
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
          to: receiversMail, // list of receivers
          subject: "Account Activation", // Subject line
          html: "<b>Dear </b> Please activate your account by clicking on the link below. <br> Thanks", // html body 
      };

     return await transporter.sendMail(mailOptions, function (error, data) {
          if(error){
              throw error;
          }
          else{
              console.log('Mail sent'); 
          }
      });   
  }  
}