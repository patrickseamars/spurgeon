// Fetch the quotes from the local JSON file
async function fetchQuotes() {
	try {
		const response = await fetch("quotes.json");
		if (!response.ok) throw new Error("Failed to load quotes");
		return await response.json();
	} catch (error) {
		console.error("Error fetching quotes:", error);
		return [
			"A Bible that’s falling apart usually belongs to someone who isn’t."
		]; // Return fallback quotes if fetch fails
	}
}

// Fetch a random image from Unsplash API
async function fetchRandomImage() {
	const url =
		"https://melodious-dusk-d264c9.netlify.app/.netlify/functions/unsplash";

	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error("Failed to load image");
		const data = await response.json();
		return data || ""; // Get the image URL
	} catch (error) {
		console.error("Error fetching image:", error);
		return "https://via.placeholder.com/1600x900?text=Error+loading+image"; // Fallback
	}
}

// Select a daily quote based on the current date
async function updateQuoteAndBackground() {
	const quotes = await fetchQuotes();
	const now = new Date();
	const start = new Date(now.getFullYear(), 0, 0);
	const diff = now - start;
	const oneDay = 1000 * 60 * 60 * 24;
	const dayOfYear = Math.floor(diff / oneDay);
	const quote = quotes[dayOfYear % quotes.length]; // Select a daily quote

	const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
	const storedDate = localStorage.getItem("lastImageDate");
	const storedImageURL = localStorage.getItem("lastImageUrl");
	const storedPhotog = localStorage.getItem("lastImagePhotog");
	const storedPhotogLink = localStorage.getItem("lastImagePhotogLink");
	const storedLocation = localStorage.getItem("lastImageLocation");

	let image, imageURL, photog, photogLink, location;

	if (storedDate === today && storedImageURL) {
		console.log("Using stored image");
		// Use the stored image if it's the same day
		imageURL = storedImageURL;
		photog = storedPhotog;
		photogLink = storedPhotogLink;
		location = storedLocation;
	} else {
		// Fetch a new image and store it with today's date
		image = await fetchRandomImage();
		imageURL = image.urls.regular;
		photog = image.user.name;
		photogLink = image.user.links.html;
		location = image.location.name;

		localStorage.setItem("lastImageDate", today);
		localStorage.setItem("lastImageUrl", image.urls.regular);
		localStorage.setItem("lastImagePhotog", image.user.name);
		localStorage.setItem("lastImagePhotogLink", image.user.links.html);
		localStorage.setItem("lastImageLocation", image.location.name);
	}

	// Update the quote and background
	document.getElementById("quote").textContent = quote;
	document.getElementById(
		"background"
	).style.backgroundImage = `url(${imageURL})`; // Set background image
	document.getElementById("photog").textContent = photog;
	document.getElementById("photog").href =
		photogLink + "?utm_source=a_moment_of_spurgeon&utm_medium=referral";
	document.getElementById("photoLink").href = imageURL;
	document.getElementById("location").textContent = location;
}

// Update the time on the page
function updateTime() {
	const now = new Date();
	const hours = String(now.getHours()).padStart(2, "0");
	const minutes = String(now.getMinutes()).padStart(2, "0");
	document.getElementById("time").textContent = `${hours}:${minutes}`;

	let timeOfDay = "";

	if (hours >= 13) {
		timeOfDay = "Good Afternoon";
	} else if (hours >= 17) {
		timeOfDay = "Good Evening";
	} else {
		timeOfDay = "Good Morning";
	}

	document.getElementById("timeOfDay").textContent = timeOfDay;
}

// Update time every second
setInterval(updateTime, 1000);
updateTime(); // Initial time update
updateQuoteAndBackground(); // Update quote and background on page load
