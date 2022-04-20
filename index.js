if (process.env.NODE_ENV !== "production") {
	require('dotenv').config()
}

const express = require('express')
const app = express()
const connection = require('./db')
const port = 3000
const path = require('path')
const methodOverride = require("method-override");
const expressLayouts = require('express-ejs-layouts')
const User = require('./models/kts-admin/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const verify = require('./middleware/verifyToken')
const { Users } = require('./middleware/fetchFromCSV')
const cookieParser = require('cookie-parser')
const nodemailer = require('nodemailer')
const NodeCache = require("node-cache");
const myCache = new NodeCache();



//Routes
const adminRoute = require('./routes/kts-admin')


//db connection
connection()

const Joi = require('@hapi/joi');
const schema = Joi.object({
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

app.use('/kts-admin', adminRoute)


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
		subject: 'Message from the Contact Us',
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

app.get('/login', (req, res) => {
	res.render('Landing-Pages/login', { layout: "./layouts/login-layout", title: "Login" })
})

app.post('/login', async (req, res) => {
	res.clearCookie("token");
	const { error } = schema.validate(req.body)
	if (error) {
		return res.status(400).send(error.details[0].message)
	}
	const { email, password } = req.body
	const user = await User.findOne({ email })
	//console.log(user)
	if (!user) {
		return res.status(400).send('failed login: invalid credentials')
	}
	const validPass = await bcrypt.compare(password, user.password)
	if (!validPass) {
		return res.status(400).send('failed login: invalid credentials')
	}

	const token = jwt.sign({ user }, process.env.TOKEN_SECRET_KEY, { expiresIn: '24h' })
	myCache.set("token", token.toString(), 10000)
	res.cookie('token', token.toString())
	if (user.isAdmin === 0) { res.redirect('/invited-individual') }
	else if (user.isAdmin === 1) { res.redirect('/event-owner') }
	else if (user.isAdmin === 2) { res.redirect('/kts-admin/home') }
})

app.post('/logout', (req, res) => {
	res.clearCookie("token");
	res.redirect('/login')
})

app.get('/password-grant', (req, res) => {
	res.render('Landing-Pages/password-grant', { layout: "./layouts/login-layout", title: "Password Grant" })
})

app.post('/password-grant', async (req, res) => {
	let transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL,
			pass: process.env.PASSWORD
		}
	});
	let hashPassword
	for (let i = 0; i < Users.length; i++) {
		hashPassword = null
		var mailOptions = {
			from: process.env.EMAIL,
			to: Users[i].email.toString(),
			subject: 'Password Granted',
			text: 'Dear Client ' + Users[i].email.toString() + ', your granted password is: ' + Users[i].password.toString()
		};
		let salt = await bcrypt.genSalt(10)
		hashPassword = await bcrypt.hash(Users[i].password, salt)
		Users[i].password = hashPassword
		Users[i].isAdmin = 0
		let emailExist = await User.findOne({ email: Users[i].email.toString() })
		if (emailExist) {
			console.log(Users[i].email + ' exists already')
		}
		else {
			let savedUser = await Users[i].save()
			transporter.sendMail(mailOptions, (err, res) => {
				if (err) {
					console.log(err);
				}
				else {
					console.log('success')
				}
			});
		}
	}
	res.redirect('/password-grant')
})

app.post('/insert-user', async (req, res) => {
	const data = req.body
	let salt = await bcrypt.genSalt(10)
	let hashPassword = await bcrypt.hash(data.password, salt)
	let insertedUser = new User({ email: data.email, password: hashPassword, isAdmin: data.isAdmin })
	await insertedUser.save()
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
		to: 'codebookinc@gmail.com, fady.chebly1@gmail.com',
		subject: 'Email Newsletter Subscription Request',
		text: 'Dear KTS Administration Team,\n\n\nKindly approve & accept the request for the subscription of this email,\n' + req.body.email + '\nin order to complete the subscription to your Email Newsletter. \n \n \n \n' + 'Thank you & Best Regards'
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

app.get('/event-owner', verify, (req, res) => {
	res.send('welcome to event owner')
})

app.get('/invited-individual', verify, (req, res) => {
	res.send('welcome to invited individual page')
})

app.listen(port, () => {
	console.log(`Listening on port ${port}`)
})
