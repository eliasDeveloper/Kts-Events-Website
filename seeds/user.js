const mongoose = require('mongoose')
const User = require('../models/kts-admin/user')
require('dotenv').config()

mongoose.connect(process.env.CONNECTION_STRING, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
	console.log("Database Connected");
});

const newUser = new User({ email: "fady.chebly1@gmail.com", password: "Tanous1258", isAdmin: 2 })

newUser.save().then((result) => {
	console.log(result)
}).catch((err) => {
	console.log(err)
});

