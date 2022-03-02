const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require("method-override");

//database connection conf
mongoose.connect("mongodb://localhost:27017/KtsWeb", {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
	console.log("Database Connected");
});
//end of database connection conf

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));


app.get('/kts-admin/home', (req, res) => {
	res.render('Kts-Admin/home')
})

app.listen(port, () => {
	console.log(`Listenin on port ${port}`)
})
