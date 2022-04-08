const fs = require('fs')
const csv = require('csv-parser')
const User = require('../models/kts-admin/user')
 
const userFct = () => {
    let users = []
    let emails = []
    let password
	let chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%&*ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const passwordLength = 12;
        fs.createReadStream('sample_data.csv')
        .pipe(csv()).on('data', (row)=>emails.push(row.Emails))
        .on('error', (err)=>console.log("ERROR"))
        .on('end', ()=>{
            for (let i = 0; i < emails.length; i++) {
                password =""
            for (let j = 0; j <= passwordLength; j++) {
                randomNumber = Math.floor(Math.random() * chars.length);
                password += chars.substring(randomNumber, randomNumber + 1);
            }
            const user = new User({
                name: null,
                email: emails[i],
                password: password,
                isAdmin: 0
            })
            users.push(user)  
        }
    })
    return users
    
}
let users = []
users = userFct()

module.exports.Users = users


