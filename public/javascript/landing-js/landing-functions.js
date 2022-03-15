const navHeads = document.querySelectorAll('.removeAddActive')
console.log(navHeads)
//adds the class active on the current head
for (let head of navHeads) {
	head.addEventListener('click', () => {
		for (let navHead of navHeads) {
			navHead.classList.remove('active')
		}
		head.classList.add('active')
	})
}

//end of function