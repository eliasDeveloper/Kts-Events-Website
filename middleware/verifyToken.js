const jwt = require('jsonwebtoken')
const NodeCache = require("node-cache");
const myCache = new NodeCache();
require('dotenv').config()

module.exports = function (req, res, next) {

	const token = req.cookies.token//req.headers['authorization']
	let cachedToken = myCache.get('token')
	console.log('hello', cachedToken)
	//localStorage.setItem('access_token', token)
	if (typeof token === 'undefined' || !token || token !== cachedToken) return res.status(401).send('Access Denied')

	try {
		const bearer = token.split(' ')
		const bearerToken = bearer[1];
		const verified = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
		req.user = verified;
		req.token = bearerToken
		next()
	}
	catch (err) {
		res.status(400).send('Invalid ' + err)
	}
}