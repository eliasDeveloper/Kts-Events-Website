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
	{ title: 'Go to anyweher', description: ' random data', price: 10.99 },
	{ title: 'Go to bla', description: ' random data', price: 10.99 },
	{ title: 'Go to the kitchen', description: ' random data', price: 154180 },
	{ title: 'Go to valhalla', description: ' random data', price: 10.99 },
	{ title: 'Go to anunu', description: ' random data', price: 10210.99 },
	{ title: 'Go to anounou', description: ' random data', price: 115120.99 },
	{ title: 'Go to anonimous', description: ' random data', price: 10.99 },
	{ title: 'Go to france', description: ' random data', price: 1011212.99 },
	{ title: 'Go to germany', description: ' random data', price: 10434.99 },
	{ title: 'Go to ukrain', description: ' random data', price: 1430.3 },
	{ title: 'Go to Lebanon', description: ' random data', price: 110.99 },
	{ title: 'Go to egypt', description: ' random data', price: 1023.99 },

]

const seedPackages = async () => {
	await Package.deleteMany({})
	await Package.insertMany(packageArr).then((res) => {
		console.log(`packages added are: ${res}`)
	})
}

seedPackages()