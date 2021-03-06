if (process.env.NODE_ENV !== "production") {
	require('dotenv').config()
}

const express = require('express')
const app = express()
const connection = require('./db')
const port = 3000
const path = require('path')
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const ExpressError = require('./utils/ExpressError');
const User = require('./models/kts-admin/user')
const methodOverride = require("method-override");
const expressLayouts = require('express-ejs-layouts')

const { isEventOwner, isInvited } = require('./middleware/loggedIn')
const { Users } = require('./middleware/fetchFromCSV')
const nodemailer = require('nodemailer')

//Routes
const adminRoute = require('./routes/kts-admin')
const userRoutes = require('./routes/users');
const eventOwner = require('./routes/event-owner')

//db connection
connection()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.set('layout', './layouts/landing-pages-layout')

app.use(expressLayouts)
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));


//reorganise !!session conf for passport
const sessionConfig = {
	secret: 'thisshouldbeabettersecret!',
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7
	}
}

app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	console.log(req.session)
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
})

app.use('/', userRoutes);
app.use('/kts-admin', adminRoute)
app.use('/event-owner', eventOwner)


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


app.get('/invited-individual', isInvited, (req, res) => {
	res.send('welcome to invited individual page')
})

app.all('*', (req, res, next) => {
	next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = 'Oh No, Something Went Wrong!'
	res.status(statusCode).render('error', { title: "Error", err })
})

app.listen(port, () => {
	console.log(`Listening on port ${port}`)
})
