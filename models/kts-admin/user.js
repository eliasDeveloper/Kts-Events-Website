const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
	email: {
		type: String,
		required: [true, 'Username cant be blank'],
		min: 4
	},
	isAdmin: {
		type: Number,
		max: 2,
		min: 0,
		default: 0
	}
})

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', UserSchema)