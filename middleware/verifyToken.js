const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = function (req, res, next) {
	const token = req.cookies.token//req.headers['authorization']

	//localStorage.setItem('access_token', token)
	if (typeof token === 'undefined' || !token) return res.status(401).send('Access Denied')

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