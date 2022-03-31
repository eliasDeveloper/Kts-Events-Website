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
	res.redirect(`/kts-admin/event/${id}`)
})
//end of add event owner logic to an event

//start of add needed data and package for a specific event
router.get('/event/:id', async (req, res) => {
	const { id } = req.params
	let event = await Event.findById(id)
	let Packages = await event.populate('packages')
	console.log(`ayre b yahouwaza ${Packages}`)
	res.render('Kts-Admin/event', { layout: "./layouts/test", title: "Event", event, id, Packages })
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


module.exports = router