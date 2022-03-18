const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require("method-override");
const expressLayouts = require('express-ejs-layouts')
const Package = require('./models/kts-admin/package')
const Event = require('./models/kts-admin/event')
const User = require('./models/kts-admin/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const verify =  require('../Kts-Events-Website/middleware/verifyToken')
const session = require('express-session')
//database connection conf
mongoose.connect("mongodb+srv://rhino11:rhino11@cluster0.wz45u.mongodb.net/KTS-DB?retryWrites=true&w=majorityy", {
	useNewUrlParser: true,
	// useCreateIndex: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
	console.log("Database Connected");
});
//end of database connection conf

const Joi = require('@hapi/joi');
const schema = Joi.object({
    name: Joi.string().min(6).required(),
    email: Joi.string().min(6).required().email(),
    password: Joi.string() .min(6) .required()
 });

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.set('layout', './layouts/landing-pages-layout')

app.use(expressLayouts)
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use(session({
    secret: 'cookie_secret',
    resave: true,
    saveUninitialized: true
}));

//landing pages routing
app.get('/', (req, res) => {
	res.render('Landing-Pages/home', { title: "KTS" })
})

app.get('/about', (req, res) => {
	res.render('Landing-Pages/about', { title: "About" })
})

app.get('/contact', (req, res) => {
	res.render('Landing-Pages/contact', { title: "Contact Us" })
})

app.get('/register', (req, res) => {
	res.render('Landing-Pages/register', { layout: "./layouts/register-layout", title: "Register" })
})

app.get('/login', (req, res) => {
	res.render('Landing-Pages/login', { layout: "./layouts/login-layout", title: "Login" })
})
app.get('/welcome', (req, res) => {
	res.render('Landing-Pages/welcome', { layout: "./layouts/welcome-layout", title: "Welcome!!" })
})
//end of landing pages routing

//start of admin pages routing
app.get('/kts-admin/home', async (req, res) => {
	const events = await Event.find({})
	res.render('Kts-Admin/home', { events, layout: "./layouts/admin-layout", title: "Admin - Home" })
})

app.get('/kts-admin/new-event', (req, res) => {
	res.render('Kts-Admin/event', { layout: "./layouts/event-layout", title: "Admin - Package", hasEvent: false })
})

app.get('/kts-admin/package/:id', async (req, res) => {
	const { id } = req.params
	const package = await Package.findById(id)
	res.render('Kts-Admin/package.ejs', { package, layout: "./layouts/admin-layout", title: "Admin - Package", hasPackage: true })
})

app.get('/kts-admin/packages', async (req, res) => {
	const packages = await Package.find({})
	res.render('Kts-Admin/packages', { packages })
})
app.post('/api/user/register',verify, async (req, res)=> {
    const {error} = schema.validate(req.body);
    //const {error} = regsiterValidation(req.body);
    if(error){
        return res.status(400).send(error.details[0].message)
    }
    //Checking if the user is already in the db
    const emailExist = await User.findOne({email: req.body.email})
    if(emailExist){
        return res.status(400).send('email already exists')
    }
	//HASH the password
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.password, salt)
    //Create a new User
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword     
    })
    try{
        const savedUser = await user.save()
        res.send({user: user._id})
    }catch(err){
        res.status(400).send(err)
    }
})
app.post('/login', async(req,res) =>{
	const {email, password}= req.body
	const user = await User.findOne({email})	
	if(!user){
        return res.status(400).send('failed login: invalid credentials')
    }
    const validPass = await bcrypt.compare(password, user.password)
    if(!validPass){
		return res.status(400).send('failed login: invalid credentials')
    }
	// else if(validPass){
	req.session.user_id= 'loggedIn'
	// 	res.redirect('/welcome')
	// }
	jwt.sign({user}, 'secretkey',{expiresIn: '24h'}, (err, token)=>{
        res.json({
            token
        })
    });
	
})
app.post('/logout', (req,res)=>{
	// req.session.user_id = null
	req.session.destroy();
	// req.session.destroy()
	// req.session.destroy((err) => {
	// 	res.redirect('/') // will always fire after session is destroyed
	//   })
	res.redirect('/login')
})

app.get('/welcome', (req,res) =>{
	if(!req.session.user_id){
		return res.redirect('/login')
	}
	res.render('welcome')
})

app.listen(port, () => {
	console.log(`Listening on port ${port}`)
})
