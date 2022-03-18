const mongoose = require('mongoose')
const Event = require('../models/kts-admin/event')
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


const addEvents = async () => {
	const package = await Package.find({})
	for (let i = 0; i < package.length; i++) {
		let newEvent = new Event({ owner: 'fady chebly', title: `Event num: ${i}`, description: `this is a test num: ${i}` })
		let arrRandom = Math.floor(Math.random() * package.length)
		for (let j = 0; j < arrRandom; j++) {
			let packageRandom = Math.floor(Math.random() * package.length)
			newEvent.packages.push(package[packageRandom])
		}
		await newEvent.save().then((res) => {
			console.log(res)
		}).catch(err => console.log(err))
	}
}

const deleteAllEvents = async () => {
	await Event.deleteMany({})
}

deleteAllEvents()
addEvents()