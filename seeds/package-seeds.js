const mongoose = require('mongoose')
const Package = require('../models/kts-admin/package')

mongoose.connect("mongodb://localhost:27017/KtsWeb", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
	console.log("Database Connected");
});


const packageArr = [
	{ title: 'Go to canada', description: 'o make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum', price: 4.99 },
	{ title: 'Go to America', description: ' the majority have suffered alteration in some form, by injected humour, or randomised words which do', price: 10.99 },
	{ title: 'Go to Lebanon', description: ' Welcome to turkey fun place', price: 51.99 },
	{ title: 'Go to Hell', description: ' random data', price: 10.99 },
]

const seedPackages = async () => {
	await Package.deleteMany({})
	await Package.insertMany(packageArr).then((res) => {
		console.log(`packages added are: ${res}`)
	})
}

seedPackages()