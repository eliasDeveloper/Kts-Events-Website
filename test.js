const fs= require('fs')
const mongoose = require('mongoose')
const csv = require('csv-parser')
const nodemailer = require('nodemailer')
require('dotenv').config()
const User = require('./models/kts-admin/user')
const emails =[]
let emailsString = ''
let chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%&*ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const passwordLength = 12;
let password = "";
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});
// database connection conf
mongoose.connect("mongodb+srv://rhino11:rhino11@cluster0.wz45u.mongodb.net/KTS-DB?retryWrites=true&w=majority", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
	console.log("Database Connected");
});
//end of database connection conf
fs.createReadStream('sample_data.csv')
.pipe(csv())
.on('data', (row) => emails.push(row.Emails))
.on('end', ()=>{
    emailsString = emails.toString()
    for(let i =0; i<emails.length;i++){
        password = "";
        for (let j=0; j <= passwordLength; j++) {
            randomNumber = Math.floor(Math.random() * chars.length);
            password += chars.substring(randomNumber, randomNumber +1);
        }
        var mailOptions = {
            from: process.env.EMAIL,
            to: emails[i].toString(),
            subject: 'Password Granted',
            text: 'Dear Client, your granted password is: '+ password
        };
        // transporter.sendMail(mailOptions, (err) => {
        //     if (err) {
        //         console.log(err);
        //     }
        //     else {
        //         console.log('success')
        //     }
        // });
        const user = new User({
            name: 'test',
            email: emails[i],
            password: password,
            isAdmin:0
        })
        console.log(user)
        try {
            const savedUser = user.save()
            //res.send({ user: user._id })
        } catch (err) {
            //res.status(400).send(err)
            console.log(err)
        }

    }
})