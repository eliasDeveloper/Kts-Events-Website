require('dotenv').config()
const nodemailer = require('nodemailer')
const { generateRandomPass } = require('./reusable')
const User = require('../models/kts-admin/user')

module.exports.eventOwnerEmail = async (req, res, username, eventId) => {
	let grantedPassword = generateRandomPass
	console.log(`ayre bel mama: ${process.env.EMAIL}`)
	console.log(`ayre bel baba: ${process.env.PASSWORD}`)
	let transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL,
			pass: process.env.PASSWORD
		}
	});


	let mailOptions = {
		from: process.env.EMAIL,
		to: username.toString(),
		subject: 'Event Owner Password Grant',
		text: 'Dear Client ' + username.toString() + ', your granted password is: ' + grantedPassword
	};
	try {
		const isAdmin = 1
		const newUser = new User({ username, isAdmin, eventId })
		const registeredUser = await User.register(newUser, grantedPassword)
		if (registeredUser) {
			req.flash('success', 'You have successfully registered the event owner')
			transporter.sendMail(mailOptions, (err, res) => {
				if (err) {
					console.log(err)
				}
				else {
					console.log('success')
				}
			})
		}
	} catch (error) {
		req.flash('error', error.message)
		res.redirect('/new-event');

	}

}