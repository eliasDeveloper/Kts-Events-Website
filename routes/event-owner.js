const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/kts-admin/user');
const { isLoggedIn, isEventOwner } = require('../middleware/loggedIn')

router.get('/home', isLoggedIn, isEventOwner, (req, res) => {
	res.render('event-owner/home', { layout: "./layouts/Admin/event", title: "event owner" })

})


module.exports = router;
