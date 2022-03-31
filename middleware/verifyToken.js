const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
	const token = req.cookies.token//req.headers['authorization']

	//localStorage.setItem('access_token', token)
	if (typeof token === 'undefined' || !token) return res.status(401).send('Access Denied')

	try {
		const bearer = token.split(' ')
		const bearerToken = bearer[1];
		const verified = jwt.verify(token, 'b23813da7f066be253e3bdfa41f87e010b585ff970ff54e428fdcc34b0ad1e50');
		req.user = verified;
		req.token = bearerToken
		next()
	}
	catch (err) {
		res.status(400).send('Invalid ' + err)
	}
}