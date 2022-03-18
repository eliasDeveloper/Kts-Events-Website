window.onload = function () {

	let home = document.querySelector('#homeHead')
	let contact = document.querySelector('#contactHead')
	let about = document.querySelector('#aboutHead')

	let currenpath = window.location.pathname
	if (currenpath == '/about') {
		about.classList.add("active")
		home.classList.remove("active")
		contact.classList.remove("active")
	}
	else if (currenpath == '/contact') {
		about.classList.remove("active")
		home.classList.remove("active")
		contact.classList.add("active")
	}
	else {
		about.classList.remove("active")
		home.classList.add("active")
		contact.classList.remove("active")
	}

}

