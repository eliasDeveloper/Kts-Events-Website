window.onload = function () {
	const navHeads = document.querySelectorAll('.removeAddActive')
	console.log(navHeads)
	//adds the class active on the current head
	for (let i = 0; i < navHeads.length; i++) {
		let currentHead = navHeads[i]
		navHeads[i].addEventListener('click', () => {
			let current = document.querySelector(".active");
			current.classList.remove(" active");
			currentHead.classList.add(" active")
		})
	}
	//end of function

}

