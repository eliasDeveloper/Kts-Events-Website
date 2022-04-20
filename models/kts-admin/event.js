const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EventSchema = new Schema({

	owner: {
		type: String,
	},
	title: {
		type: String,
	},
	description: {
		type: String,
	},
	packages: [{ type: Schema.Types.ObjectId, ref: 'Package' }]

})

module.exports = mongoose.model('Event', EventSchema)