const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require("method-override");
const Package = require('./models/kts-admin/package')
const Event = require('./models/kts-admin/event')

//database connection conf
mongoose.connect("mongodb://localhost:27017/KtsWeb", {
	useNewUrlParser: true,
	// useCreateIndex: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
	console.log("Database Connected");
});
//end of database connection conf

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));


app.get('/kts-admin/home', async (req, res) => {
	const events = await Event.find({})
	res.render('Kts-Admin/home', { events })
})

app.get('/kts-admin/packages', async (req, res) => {
	const packages = await Package.find({})
	res.render('Kts-Admin/packages', { packages })
})

app.get('/kts-admin/packages/:id', async (req, res) => {
	const { id } = req.params
	const package = await Package.findById(id)
	res.render('Kts-Admin/package.ejs', { package })
})

app.listen(port, () => {
	console.log(`Listening on port ${port}`)
})
