const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PackageSchema = new Schema({
	// images: [
	// 	{
	// 		url: String,
	// 		filename: String
	// 	}
	// ],
	image_url: {
		type: String
	},
	image_filename: {
		type: String
	},
	title: {
		type: String,
	},
	description: {
		type: String,
	},
	price: {
		type: Number,
	}
})

module.exports = mongoose.model('Package', PackageSchema)