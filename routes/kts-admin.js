const express = require('express')
const router = express.Router()
const Package = require('../models/kts-admin/package')
const Event = require('../models/kts-admin/event')
const User = require('../models/kts-admin/user')

router.get('/home', async (req, res) => {
	const events = await Event.find({})
	res.render('Kts-Admin/home', { events, layout: "./layouts/admin-layout", title: "Admin - Home" })
})

//event owner add page
router.get('/new-event', (req, res) => {
	res.render('Kts-Admin/event-owner', { layout: "./layouts/admin-layout", title: "Admin - New Event" })
})

//post the owner for a new event and go to fill the event with the needed data
router.post('/event', async (req, res) => {
	const { email } = req.body
	const newEvent = new Event({ owner: `${email}` })
	await newEvent.save().then(res => { console.log(`success to post event owner`) }).catch(err => { console.log(err) })
	const id = newEvent._id.toString()
	res.redirect(`/kts-admin/event/${id}/details`)
})

router.get('/event/:eventid/details', (req, res) => {
	const { eventid } = req.params
	res.render('Kts-Admin/event-details', { layout: "./layouts/admin-layout", title: "Admin - Event Details", eventid })
})

router.post('/event/:eventid/details', async (req, res) => {
	const { eventid } = req.params
	await Event.findByIdAndUpdate({ _id: eventid }, req.body)
	const savedEvent = await Event.findById(eventid)
	console.log(`added title and description ${savedEvent}`)
	res.redirect(`/Kts-Admin/event/${eventid}`)
})

//start of add needed data and package for a specific event
router.get('/event/:id', async (req, res) => {
	const { id } = req.params
	let event = await Event.findById(id)
	let Packages = await event.populate('packages')
	console.log(`ayre b yahouwaza ${Packages}`)
	res.render('Kts-Admin/event', { layout: "./layouts/admin-layout", title: "Event", event, id, Packages })
})

// start of add package go to add a package related to the event
router.get('/event/:id/package', async (req, res) => {
	const { id } = req.params
	res.render('Kts-Admin/package', { layout: "./layouts/admin-layout", title: "package", id, hasPackage: false })
})
//end of add package


//returns with the package added concerning the specific event
router.post('/event/:id/package', async (req, res) => {
	const { id } = req.params
	let event = await Event.findById(id)
	const newPackage = req.body
	let addedPackage = new Package({ title: newPackage.title, description: newPackage.description, price: newPackage.price })
	await addedPackage.save()
	event.packages.push(addedPackage._id)
	await event.save()
	res.redirect(`/kts-admin/event/${id}`)
})

router.get('/:id/package/:packageId', async (req, res) => {
	const { packageId } = req.params
	const { id } = req.params
	let package = await Package.findById(packageId)
	res.render('Kts-Admin/package', { layout: "./layouts/admin-layout", title: "Edit Package", id, hasPackage: true, package, packageId })
})

router.post('/:id/package/:packageId', async (req, res) => {
	const { packageId } = req.params
	const { id } = req.params
	await Package.findByIdAndUpdate({ _id: packageId }, req.body)
	res.redirect(`/kts-admin/event/${id}`)
})

router.delete('/delete/package/:packageid/event/:eventId', async (req, res) => {
	const { packageid } = req.params
	const { eventId } = req.params
	await Package.findByIdAndDelete(packageid)
	await Event.findById(eventId)
	res.redirect(`/kts-admin/event/${eventId}`)
})

router.delete('/delete/event/:eventid', async (req, res) => {
	const { eventid } = req.params
	console.log(eventid)
	const deleteEvent = await Event.findByIdAndDelete(eventid)
	console.log(deleteEvent)
	res.redirect('/kts-admin/home')
})


router.post('/SaveEvent/:eventid', async (req, res) => {
	const { eventid } = req.params
	await Event.findByIdAndUpdate({ _id: eventid }, req.body)
	const savedEvent = await Event.findById(eventid)
	console.log(savedEvent)
	res.redirect('/kts-admin/home')
})

module.exports = router