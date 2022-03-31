const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require("method-override");
const expressLayouts = require('express-ejs-layouts')
const User = require('./models/kts-admin/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const verify = require('./middleware/verifyToken')
const cookieParser = require('cookie-parser')
const nodemailer = require('nodemailer')
const adminRoute = require('./routes/kts-admin')
require('dotenv').config()

//mecha el hal?
// database connection conf
mongoose.connect(process.env.CONNECTION_STRING, {
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
	if (!user) {
		return res.status(400).send('failed login: invalid credentials')
	}
	const validPass = await bcrypt.compare(password, user.password)
	if (!validPass) {
		return res.status(400).send('failed login: invalid credentials')
	}
	const token = jwt.sign({ user }, process.env.TOKEN_SECRET_KEY, { expiresIn: '24h' })
	res.cookie('token', token.toString())
	res.redirect('/welcome')
})

app.get('/welcome', (req, res) => {
	if (req.cookies.token)
		res.render('Landing-Pages/welcome', { layout: "./layouts/welcome-layout", title: "Welcome!!" })
	else {
		res.redirect('login')
	}
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
		password: hashPassword,
		isAdmin: 0
	})
	try {
		const savedUser = await user.save()
		res.send({ user: user._id })
	} catch (err) {
		res.status(400).send(err)
	}
})


app.post('/password-grant', async (req, res) => {
	let emails = []
	let chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%&*ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const passwordLength = 12;
	let transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL,
			pass: process.env.PASSWORD
		}
	});
	fs.createReadStream('sample_data.csv')
		.pipe(csv())
		.on('data', (row) => emails.push(row.Emails))
		.on('end', () => {
			for (let i = 0; i < emails.length; i++) {
				password = "";
				for (let j = 0; j <= passwordLength; j++) {
					randomNumber = Math.floor(Math.random() * chars.length);
					password += chars.substring(randomNumber, randomNumber + 1);
				}
				var mailOptions = {
					from: process.env.EMAIL,
					to: emails[i].toString(),
					subject: 'Password Granted',
					text: 'Dear Client, your granted password is: ' + password
				};
				//Checking if the user is already in the db
				const emailExist = User.findOne({ email: emails[i].toString() })
				if (emailExist) {
					console.log('email already exists')
				}
				//Create a new User
				else {
					transporter.sendMail(mailOptions, (err) => {
						if (err) {
							console.log(err);
						}
						else {
							console.log('success')
						}
					});
					const user = new User({
						name: 'test',
						email: emails[i],
						password: password,
						isAdmin: 0
					})
					try {
						user.save()
					} catch (err) {
						console.log(err)
					}
				}
			}
		})
})

app.post('/logout', (req, res) => {
	res.clearCookie("token");
	res.redirect('/login')
})

app.get('/welcome', verify, (req, res) => {
	if (!req.cookies.token) {
		return res.redirect('login')
	}
	else {
		return res.redirect('welcome')
	}
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

app.listen(port, () => {
	console.log(`Listening on port ${port}`)
})
