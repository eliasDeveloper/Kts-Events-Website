const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require("method-override");
const expressLayouts = require('express-ejs-layouts')
const Package = require('./models/kts-admin/package')
const Event = require('./models/kts-admin/event')
const User = require('./models/kts-admin/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const verify = require('./middleware/verifyToken')
const cookieParser = require('cookie-parser')
const nodemailer = require('nodemailer')
require('dotenv').config()

// database connection conf
// mongoose.connect("mongodb+srv://rhino11:rhino11@cluster0.wz45u.mongodb.net/KTS-DB?retryWrites=true&w=majority", {
// 	useNewUrlParser: true,
// 	useUnifiedTopology: true,
// });

mongoose.connect("mongodb://localhost:27017/KtsWeb", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
	console.log("Database Connected");
});
//end of database connection conf

const Joi = require('@hapi/joi');
const schema = Joi.object({
	name: Joi.string().min(6).required(),
	email: Joi.string().min(6).required().email(),
	password: Joi.string().min(6).required()
});

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.set('layout', './layouts/landing-pages-layout')

app.use(expressLayouts)
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(cookieParser())


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
	res.render('Landing-Pages/register', { layout: "./layouts/register-layout", title: "Register" })
})

app.get('/login', (req, res) => {
	res.render('Landing-Pages/login', { layout: "./layouts/login-layout", title: "Login" })
})
app.get('/welcome', (req, res) => {
	res.render('Landing-Pages/welcome', { layout: "./layouts/welcome-layout", title: "Welcome!!" })
})
//end of landing pages routing


//start of admin routes
app.get('/kts-admin/home', async (req, res) => {
	const events = await Event.find({})
	res.render('Kts-Admin/home', { events, layout: "./layouts/admin-layout", title: "Admin - Home" })
})

//event owner add page
app.get('/kts-admin/new-event', (req, res) => {
	res.render('Kts-Admin/event-owner', { layout: "./layouts/admin-layout", title: "Admin - New Event" })
})

//post the owner for a new event and go to fill the event with the needed data
app.post('/kts-admin/event', async (req, res) => {
	const { email } = req.body
	const newEvent = new Event({ owner: `${email}` })
	await newEvent.save().then(res => { console.log(`success to post event owner`) }).catch(err => { console.log(err) })
	const id = newEvent._id.toString()
	res.redirect(`/kts-admin/event/${id}`)
})
//end of add event owner logic to an event

//start of add needed data and package for a specific event
app.get('/kts-admin/event/:id', async (req, res) => {
	const { id } = req.params
	let event = await Event.findById(id)
	let Packages = await event.populate('packages')
	console.log(`ayre b yahouwaza ${Packages}`)
	res.render('Kts-Admin/event', { layout: "./layouts/admin-layout", title: "Event", event, id, Packages })
})

// start of add package go to add a package related to the event
app.get('/kts-admin/event/:id/package', async (req, res) => {
	const { id } = req.params
	res.render('Kts-Admin/package', { layout: "./layouts/test", title: "package", id })
})
//end of add package

//returns with the package added concerning the specific event
app.post('/kts-admin/event/:id/add-package', async (req, res) => {
	const { id } = req.params
	let event = await Event.findById(id)
	const newPackage = req.body
	let addedPackage = new Package({ title: newPackage.title, description: newPackage.description, price: newPackage.price })
	await addedPackage.save()
	event.packages.push(addedPackage._id)
	await event.save()
	res.redirect(`/kts-admin/event/${id}`)
})


app.post('/api/user/register', async (req, res) => {
	const { error } = schema.validate(req.body);
	//const {error} = regsiterValidation(req.body);
	if (error) {
		return res.status(400).send(error.details[0].message)
	}
	//Checking if the user is already in the db
	const emailExist = await User.findOne({ email: req.body.email })
	if (emailExist) {
		return res.status(400).send('email already exists')
	}
	//HASH the password
	const salt = await bcrypt.genSalt(10)
	const hashPassword = await bcrypt.hash(req.body.password, salt)
	//Create a new User
	const user = new User({
		name: req.body.name,
		email: req.body.email,
		password: hashPassword
	})
	try {
		const savedUser = await user.save()
		res.send({ user: user._id })
	} catch (err) {
		res.status(400).send(err)
	}
})

app.post('/login', async (req, res) => {
	res.clearCookie("token");
	const { email, password } = req.body
	const user = await User.findOne({ email })
	if (!user) {
		return res.status(400).send('failed login: invalid credentials')
	}
	const validPass = await bcrypt.compare(password, user.password)
	if (!validPass) {
		return res.status(400).send('failed login: invalid credentials')
	}
	const token = jwt.sign({ user }, 'b23813da7f066be253e3bdfa41f87e010b585ff970ff54e428fdcc34b0ad1e50', { expiresIn: '24h' })
	res.cookie('token', token.toString())
	res.redirect('/welcome')
})

app.post('/logout', (req, res) => {
	res.clearCookie("token");
	res.redirect('/login')
})

app.get('/welcome', verify, (req, res) => {
	if (req.cookies.token) {
		return res.redirect('/login')
	}
	res.render('welcome')
})

app.post('/contact', (req, res) => {
	let transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL,
			pass: process.env.PASSWORD
		}
	});
	var mailOptions = {
		from: req.body.name + '&lt;' + process.env.EMAIL + '&gt;',
		to: 'codebookinc@gmail.com, fady.chebly1@gmail.com',
		subject: 'KTS Feedback',
		text: req.body.feedback
	};
	transporter.sendMail(mailOptions, (err, res) => {
		if (err) {
			console.log(err);
		}
		else {
			console.log('success')
		}
	});
	res.redirect('contact')
})

app.post('/subscribe', (req, res) => {
	let transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL,
			pass: process.env.PASSWORD
		}
	});
	var mailOptions = {
		from: process.env.EMAIL,
		to: 'fady.chebly1@gmail.com',
		subject: 'Newsletter Subscription Request',
		text: 'Dear Nicolas, kindly subscribe me to your newsletter ya akhou el sharmuta ' + req.body.email
	};
	transporter.sendMail(mailOptions, (err, res) => {
		if (err) {
			console.log(err);
		}
		else {
			console.log('success')
		}
	});
	res.redirect('/')
})

app.listen(port, () => {
	console.log(`Listening on port ${port}`)
})
