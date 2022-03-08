const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EventSchema = new Schema({

	owner: {
		type: String,
		required: true
	},
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	packages: [{ type: Schema.Types.ObjectId, ref: 'Package' }],
	dateOfCreation: {
		type: Date,
		// required: true
	}

})

module.exports = mongoose.model('Event', EventSchema)