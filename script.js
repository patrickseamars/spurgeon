// Fetch the quotes from the local JSON file
async function fetchQuotes() {
	try {
		const response = await fetch('quotes.json')
		if (!response.ok) throw new Error('Failed to load quotes')
		return await response.json()
	} catch (error) {
		console.error('Error fetching quotes:', error)
		return [
			'A Bible that’s falling apart usually belongs to someone who isn’t.'
		] // Return fallback quotes if fetch fails
	}
}

// Fetch a random image from Unsplash API
async function fetchRandomImage() {
	const url =
		'https://melodious-dusk-d264c9.netlify.app/.netlify/functions/unsplash'

	try {
		const response = await fetch(url)
		if (!response.ok) throw new Error('Failed to load image')
		const data = await response.json()
		return data.urls.regular || '' // Get the image URL
	} catch (error) {
		console.error('Error fetching image:', error)
		return 'https://via.placeholder.com/1600x900?text=Error+loading+image' // Fallback
	}
}

// Select a daily quote based on the current date
async function updateQuoteAndBackground() {
	const quotes = await fetchQuotes()
	const quote = quotes[new Date().getDate() % quotes.length] // Select a daily quote

	const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format
	const storedDate = localStorage.getItem('lastImageDate')
	const storedImage = localStorage.getItem('lastImageUrl')

	let image = await fetchRandomImage()

	if (storedDate === today && storedImage) {
		// Use the stored image if it's the same day
		image = storedImage
	} else {
		// Fetch a new image and store it with today's date
		image = await fetchRandomImage()
		localStorage.setItem('lastImageDate', today)
		localStorage.setItem('lastImageUrl', image)
	}

	// Update the quote and background
	document.getElementById('quote').textContent = quote
	document.getElementById('background').style.backgroundImage = `url(${image})` // Set background image
}

// Update the time on the page
function updateTime() {
	const now = new Date()
	const hours = String(now.getHours()).padStart(2, '0')
	const minutes = String(now.getMinutes()).padStart(2, '0')
	document.getElementById('time').textContent = `${hours}:${minutes}`

	let timeOfDay = ''

	if (hours >= 13) {
		timeOfDay = 'Good Afternoon'
	} else if (hours >= 17) {
		timeOfDay = 'Good Evening'
	} else {
		timeOfDay = 'Good Morning'
	}

	document.getElementById('timeOfDay').textContent = timeOfDay
}

// Update time every second
setInterval(updateTime, 1000)
updateTime() // Initial time update
updateQuoteAndBackground() // Update quote and background on page load
