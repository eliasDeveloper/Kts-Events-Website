const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require("method-override");
const expressLayouts = require('express-ejs-layouts')
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
app.set('layout', './layouts/landing-pages-layout')

app.use(expressLayouts)
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

//landing pages routing
app.get('/', (req, res) => {
	res.render('Landing-Pages/home', { title: "KTS" })
})

app.get('/about', (req, res) => {
	res.render('Landing-Pages/about', { title: "About" })
})

app.get('/contact', (req, res) => {
	res.render('Landing-Pages/contact', { title: "Contact Us" })
})

app.get('/register', (req, res) => {
	res.render('Landing-Pages/register', {  layout: "./layouts/register-layout", title: "Register" })
})

app.get('/login', (req, res) => {
	res.render('Landing-Pages/login', { layout: "./layouts/login-layout", title: "Login" })
})
//end of landing pages routing

//start of admin pages routing
app.get('/kts-admin/home', async (req, res) => {
	const events = await Event.find({})
	res.render('Kts-Admin/home', { events, layout: "./layouts/admin-layout", title: "Admin - Home" })
})

app.get('/kts-admin/new-event', (req, res) => {
	res.render('Kts-Admin/test', { layout: "./layouts/event-layout", title: "Admin - Package", hasEvent: false })
})

app.get('/kts-admin/package/:id', async (req, res) => {
	const { id } = req.params
	const package = await Package.findById(id)
	res.render('Kts-Admin/package.ejs', { package, layout: "./layouts/admin-layout", title: "Admin - Package", hasPackage: true })
})

app.get('/kts-admin/packages', async (req, res) => {
	const packages = await Package.find({})
	res.render('Kts-Admin/packages', { packages })
})



app.listen(port, () => {
	console.log(`Listening on port ${port}`)
})
