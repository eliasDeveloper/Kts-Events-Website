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


const addEvent = async () => {
	const package = await Package.findOne({ title: 'Go to canada' })
	const newEvent = new Event({ owner: 'fady chebly', title: 'First Event', description: 'Ayre b nicolas' })
	await newEvent.save().then((res) => {
		console.log(res)
	})
	newEvent.packages.push(package)
	await newEvent.save().then((res) => {
		console.log(res)
	})
}

const deleteAllEvents = async () => {
	await Event.deleteMany({})
}

addEvent()
// deleteAllEvents()