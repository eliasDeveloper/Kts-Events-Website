
let password = ''
let randomNumber = 0
let chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%&*ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let arrChars = [...chars]
const passwordLength = 12;
for (let i = 0; i <= passwordLength; i++) {
	randomNumber = Math.floor(Math.random() * chars.length);
	password += arrChars[randomNumber]
}

module.exports.generateRandomPass = password
