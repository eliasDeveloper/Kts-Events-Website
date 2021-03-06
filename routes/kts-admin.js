const express = require('express')
const router = express.Router()
const multer = require('multer')
const { storage, cloudinary } = require('../cloudinary')
const upload = multer({ storage })
const Package = require('../models/kts-admin/package')
const Event = require('../models/kts-admin/event')
const { isLoggedIn, isAdmin } = require('../middleware/loggedIn')
const { eventOwnerEmail } = require('../middleware/emailHandler')
const User = require('../models/kts-admin/user')

router.get('/home', isLoggedIn, isAdmin, async (req, res) => {
	const events = await Event.find({})
	res.render('Kts-Admin/home', { events, layout: "./layouts/admin-layout", title: "Admin - Home" })
})

router.get('/new-event', isLoggedIn, isAdmin, (req, res) => {
	res.render('Kts-Admin/event-owner', { layout: "./layouts/Admin/event", title: "Admin - New Event" })
})

router.post('/event', isLoggedIn, isAdmin, async (req, res) => {
	const { username } = req.body
	const foundUser = await User.findOne({ username: `${username}` })
	if (foundUser) {
		req.flash('error', `${username} is already an event owner to an already existing event`)
		res.redirect('/kts-admin/new-event')
	}
	else {
		const newEvent = new Event({ owner: `${username}` })
		await newEvent.save().then(res => { console.log(`success to post event owner`) }).catch(err => { console.log(err) })
		const id = newEvent._id.toString()
		await eventOwnerEmail(req, res, username, id)
		res.redirect(`/kts-admin/event/${id}/details`)
	}
})

router.route('/event/:eventid/details')
	.get(isLoggedIn, isAdmin, (req, res) => {
		const { eventid } = req.params
		res.render('Kts-Admin/event-details', { layout: "./layouts/Admin/event", title: "Admin - Event Details", eventid })
	})
	.post(isLoggedIn, isAdmin, async (req, res) => {
		const { eventid } = req.params
		await Event.findByIdAndUpdate({ _id: eventid }, req.body)
		const savedEvent = await Event.findById(eventid)
		console.log(`added title and description ${savedEvent}`)
		res.redirect(`/Kts-Admin/event/${eventid}`)
	})

router.get('/event/:id', isLoggedIn, isAdmin, async (req, res) => {
	const { id } = req.params
	let event = await Event.findById(id)
	let Packages = await event.populate('packages')
	console.log(`${Packages}`)
	res.render('Kts-Admin/event', { layout: "./layouts/Admin/event", title: "Event", event, id, Packages })
})

router.route('/event/:id/package')
	.get(isLoggedIn, isAdmin, (req, res) => {
		const { id } = req.params
		res.render('Kts-Admin/package', { layout: "./layouts/Admin/event", title: "package", id, hasPackage: false })
	})
	.post(isLoggedIn, isAdmin, upload.single('image'), async (req, res) => {
		const { id } = req.params
		let event = await Event.findById(id)
		const newPackage = req.body
		let addedPackage = new Package({ title: newPackage.title, description: newPackage.description, price: newPackage.price })
		let imagedetails = await req.file
		addedPackage.image_url = imagedetails.path
		addedPackage.image_filename = imagedetails.filename
		await addedPackage.save()
		console.log(`${addedPackage}`)
		event.packages.push(addedPackage._id)
		await event.save()
		res.redirect(`/kts-admin/event/${id}`)
	})


router.get('/:id/package/:packageId', isLoggedIn, isAdmin, async (req, res) => {
	const { packageId } = req.params
	const { id } = req.params
	let package = await Package.findById(packageId)
	res.render('Kts-Admin/package', { layout: "./layouts/Admin/event", title: "Edit Package", id, hasPackage: true, package, packageId })
})

router.post('/:id/package/:packageId', isLoggedIn, isAdmin, async (req, res) => {
	const { packageId } = req.params
	const { id } = req.params
	await Package.findByIdAndUpdate({ _id: packageId }, req.body)
	res.redirect(`/kts-admin/event/${id}`)
})

router.delete('/delete/package/:packageid/event/:eventId', isLoggedIn, isAdmin, async (req, res) => {
	const { packageid } = req.params
	const { eventId } = req.params
	const deletedPackage = await Package.findById(packageid)
	await cloudinary.uploader.destroy(deletedPackage.image_filename)
	await Package.findByIdAndDelete(packageid)
	await Event.findById(eventId)
	res.redirect(`/kts-admin/event/${eventId}`)
})

router.delete('/delete/event/:eventid', isLoggedIn, isAdmin, async (req, res) => {
	const { eventid } = req.params
	const event = await Event.findById(eventid).populate('packages')
	for (let package of event.packages) {
		await Package.findByIdAndDelete(package._id)
	}
	await Event.findByIdAndDelete(eventid)
	const AllUsers = await User.find({ eventId: eventid })
	for (let user of AllUsers) {
		await User.findByIdAndDelete(user._id)
	}
	res.redirect('/kts-admin/home')
})

router.post('/SaveEvent/:eventid', isLoggedIn, isAdmin, async (req, res) => {
	const { eventid } = req.params
	await Event.findByIdAndUpdate({ _id: eventid }, req.body)
	const savedEvent = await Event.findById(eventid)
	console.log(savedEvent)
	res.redirect('/kts-admin/home')
})

module.exports = router