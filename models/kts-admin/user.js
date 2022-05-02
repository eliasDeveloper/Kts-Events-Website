const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
	isAdmin: {
		type: Number,
		max: 2,
		min: 0,
		default: 0
	},
	eventId: {
		type: String
	}
})

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', UserSchema)