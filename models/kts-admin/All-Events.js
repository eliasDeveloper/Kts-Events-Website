const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EventSchema = new Schema({

	eventOwner: String,


})

module.exports = mongoose.model('AllEvents', EventSchema)