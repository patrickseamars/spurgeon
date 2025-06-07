// Loader state management
let loaderVisible = false;
const loader = document.getElementById("loader");
const container = document.querySelector(".container");
const backgroundDiv = document.querySelector(".background");

// Initialize loader visibility based on localStorage
function initializeLoader() {
	const storedDate = localStorage.getItem("lastImageDate");
	const today = new Date().toISOString().split("T")[0];
	const storedImages = JSON.parse(localStorage.getItem("imagesArray")) || [];
	
	// If we have cached images for today, show container immediately
	if (storedDate === today && storedImages.length > 0) {
		container.style.display = "block";
		container.style.opacity = "1";
		loader.style.display = "none";
		loaderVisible = false;
		loadBackgroundImage();
		return;
	}
	
	// Otherwise, show loader
	loader.style.display = "flex";
	container.style.display = "none";
	loaderVisible = true;
	loadBackgroundImage();
}

// Update loader visibility
function updateLoader(visible) {
	if (visible) {
		loader.style.display = "flex";
		container.style.display = "none";
		loaderVisible = true;
	} else {
		loader.style.display = "none";
		container.style.display = "block";
		loaderVisible = false;
	}
}

// Load background image and fade it in when ready
async function loadBackgroundImage() {
	try {
		const storedDate = localStorage.getItem("lastImageDate");
		const today = new Date().toISOString().split("T")[0];
		const storedImages = JSON.parse(localStorage.getItem("imagesArray")) || [];
		
		// If we have cached images for today
		if (storedDate === today && storedImages.length > 0) {
			const randomImage = storedImages[Math.floor(Math.random() * storedImages.length)];
			applyBackgroundImage(randomImage);
			return;
		}
		
		// Show loader before fetching new images
		updateLoader(true);
		
		// Otherwise, fetch new images
		const images = await fetchRandomImages();
		if (images.length > 0) {
			const randomImage = images[Math.floor(Math.random() * images.length)];
			applyBackgroundImage(randomImage);
		}
	} catch (error) {
		console.error("Error loading background image:", error);
		// Apply fallback image
		const fallbackImageURL = "./garrett-parker-DlkF4-dbCOU-unsplash.jpg";
		applyBackgroundImage({
			url: fallbackImageURL,
			photographer: "Garrett Parker",
			photographerUrl: "https://unsplash.com/@garrettpsystems",
			location: "Moraine Lake, Canada"
		});
	}
}

// Apply background image with fade-in animation
function applyBackgroundImage(imageData) {
	// Store the image data
	localStorage.setItem("lastImageDate", new Date().toISOString().split("T")[0]);
	localStorage.setItem("imagesArray", JSON.stringify([imageData]));
	
	// Set background image
	backgroundDiv.style.backgroundImage = `url(${imageData.url})`;
	
	// Fade in the background
	backgroundDiv.style.opacity = "0";
	backgroundDiv.style.display = "block";
	setTimeout(() => {
		backgroundDiv.style.opacity = "1";
		updateLoader(false);
	}, 100); // Small delay to ensure transition works
}

// Fallback functions for backward compatibility
function hideLoader() {
	loader.style.display = "none";
	container.style.display = "block";
	loaderVisible = false;
}

function showLoader() {
	loader.style.display = "flex";
	container.style.display = "none";
	loaderVisible = true;
}

// Fetch functions
async function fetchQuotes() {
	try {
		const response = await fetch("quotes.json");
		if (!response.ok) throw new Error("Failed to load quotes");
		const quotes = await response.json();
		return quotes;
	} catch (error) {
		console.error("Error fetching quotes:", error);
		return [
			"A Bible that's falling apart usually belongs to someone who isn't.",
		];
	}
}

async function fetchRandomImages() {
	const url =
		"https://melodious-dusk-d264c9.netlify.app/.netlify/functions/unsplash";
	try {
		const promises = Array.from({ length: 10 }, () =>
			fetch(url).then((res) => res.json())
		);
		const images = await Promise.all(promises);
		return images;
	} catch (error) {
		console.error("Error fetching images:", error);
		throw error;
	}
}

async function updateQuoteAndBackground() {
	const quotes = await fetchQuotes();
	const now = new Date();
	const start = new Date(now.getFullYear(), 0, 0);
	const diff = now - start;
	const oneDay = 1000 * 60 * 60 * 24;
	const dayOfYear = Math.floor(diff / oneDay);
	const quote = quotes[dayOfYear % quotes.length];

	const today = new Date().toISOString().split("T")[0];
	const storedDate = localStorage.getItem("lastImageDate");
	const storedImages = JSON.parse(localStorage.getItem("imagesArray")) || [];
	const storedImageIndex =
		parseInt(localStorage.getItem("imageIndex"), 10) || 0;

	if (storedDate === today && storedImages.length > 0) {
		// Use cached image - no need to show loader
		const image = storedImages[storedImageIndex];
		const imageURL = image.urls.full;
		const photog = image.user.name;
		const photogLink = image.user.links.html;
		const location = image.location.name;

		const img = new Image();
		img.src = imageURL;
		img.onload = () => {
			document.getElementById("background").style.backgroundImage =
				`url(${imageURL})`;
			document.getElementById("photog").textContent = photog;
			document.getElementById("photog").href =
				`${photogLink}?utm_source=a_moment_of_spurgeon&utm_medium=referral`;
			document.getElementById("photoLink").href = imageURL;
			document.getElementById("location").textContent = location;

			// Use requestAnimationFrame to ensure smooth animation
			requestAnimationFrame(() => {
				document.querySelector(".container").style.opacity = "1";
				document.querySelector(".attribution").style.opacity = "1";
			});
		};
		img.onerror = () => {
			updateLoader(false);
		};
	} else {
		// Only show loader when we need to fetch new images
		updateLoader(true);
		const images = await fetchRandomImages();
		const image = images[0];
		const imageURL = image.urls.full;
		const photog = image.user.name;
		const photogLink = image.user.links.html;
		const location = image.location.name;

		localStorage.setItem("imagesArray", JSON.stringify(images));
		localStorage.setItem("imageIndex", 0);
		localStorage.setItem("lastImageDate", today);

		const img = new Image();
		img.src = imageURL;
		img.onload = () => {
			document.getElementById("background").style.backgroundImage =
				`url(${imageURL})`;
			document.getElementById("photog").textContent = photog;
			document.getElementById("photog").href =
				`${photogLink}?utm_source=a_moment_of_spurgeon&utm_medium=referral`;
			document.getElementById("photoLink").href = imageURL;
			document.getElementById("location").textContent = location;
			updateLoader(false);
			// Use requestAnimationFrame to ensure smooth animation
			requestAnimationFrame(() => {
				document.querySelector(".container").style.opacity = "1";
				document.querySelector(".attribution").style.opacity = "1";
			});
		};
		img.onerror = () => {
			updateLoader(false);
		};
	}
	document.getElementById("quote").textContent = quote;
}

async function fetchAndUpdateImage() {
	let images = JSON.parse(localStorage.getItem("imagesArray")) || [];
	let imageIndex = parseInt(localStorage.getItem("imageIndex"), 10) || 0;

	if (images.length === 0 || imageIndex >= images.length - 1) {
		showLoader();
		images = await fetchRandomImages();
		imageIndex = 0;
		localStorage.setItem("imagesArray", JSON.stringify(images));
	} else {
		imageIndex++;
	}

	localStorage.setItem("imageIndex", imageIndex);

	const image = images[imageIndex];
	const imageURL = image.urls.full;
	const photog = image.user.name;
	const photogLink = image.user.links.html;
	const location = image.location.name;

	const img = new Image();
	img.src = imageURL;
	img.onload = () => {
		document.getElementById("background").style.backgroundImage =
			`url(${imageURL})`;
		document.getElementById("photog").textContent = photog;
		document.getElementById("photog").href =
			`${photogLink}?utm_source=a_moment_of_spurgeon&utm_medium=referral`;
		document.getElementById("photoLink").href = imageURL;
		document.getElementById("location").textContent = location;

		document.querySelector(".container").style.display = "block";
		hideLoader();
	};
}

async function fetchAndUpdateQuote() {
	const quotes = await fetchQuotes();
	const quote = quotes[Math.floor(Math.random() * quotes.length)];
	document.getElementById("quote").textContent = quote;
	localStorage.setItem("lastQuote", quote);
}

let is24HourFormat = localStorage.getItem("is24HourFormat") === "true";

function toggleTimeFormat() {
	is24HourFormat = !is24HourFormat;
	localStorage.setItem("is24HourFormat", is24HourFormat);
	updateTime();
}

function updateTime() {
	const now = new Date();
	let hours = now.getHours();
	const minutes = String(now.getMinutes()).padStart(2, "0");

	let timeOfDay = "";

	if (is24HourFormat) {
		hours = String(hours).padStart(2, "0");
		document.getElementById("time").textContent = `${hours}:${minutes}`;
	} else {
		const period = hours >= 12 ? "PM" : "AM";
		hours = hours % 12 || 12;
		document.getElementById("time").textContent =
			`${hours}:${minutes} ${period}`;
	}

	const displayHours = now.getHours();

	if (displayHours >= 17) {
		timeOfDay = "Good Evening";
	} else if (displayHours >= 12) {
		timeOfDay = "Good Afternoon";
	} else {
		timeOfDay = "Good Morning";
	}

	const userName = localStorage.getItem("userName");
	if (userName) {
		document.getElementById("timeOfDay").textContent =
			`${timeOfDay}, ${userName}`;
		document.getElementById("userNamePrompt").style.display = "none";
		document.getElementById("userNameInput").style.display = "none";
	} else {
		document.getElementById("timeOfDay").textContent = timeOfDay;
		document.getElementById("userNamePrompt").style.display = "inline";
		document.getElementById("userNameInput").style.display = "inline";
	}
}

// Preload image and check for cached data
async function preloadImage() {
	const today = new Date().toISOString().split("T")[0];
	const storedDate = localStorage.getItem("lastImageDate");
	const storedImages = JSON.parse(localStorage.getItem("imagesArray")) || [];
	const storedImageIndex =
		parseInt(localStorage.getItem("imageIndex"), 10) || 0;
	const background = document.getElementById("background");

	if (storedDate === today && storedImages.length > 0) {
		// Use cached image
		const image = storedImages[storedImageIndex];
		const imageURL = image.urls.full;

		// Preload the image
		const img = new Image();
		img.src = imageURL;
		img.onload = () => {
			// Set background image immediately
			background.style.backgroundImage = `url(${imageURL})`;
			// Force immediate background display
			background.style.opacity = "1";
			// Show container with opacity transition
			requestAnimationFrame(() => {
				document.querySelector(".container").style.opacity = "1";
				document.querySelector(".attribution").style.opacity = "1";
			});
		};
		img.onerror = () => {
			// If cached image fails to load, use fallback
			const fallbackImageURL = "./garrett-parker-DlkF4-dbCOU-unsplash.jpg";
			background.style.backgroundImage = `url(${fallbackImageURL})`;
			// Force immediate background display
			background.style.opacity = "1";
		};
		return true;
	}
	return false;
}

document.addEventListener("DOMContentLoaded", async () => {
	// First try to preload cached image
	const hasCachedImage = await preloadImage();

	if (!hasCachedImage) {
		// If no cached image, show loader and fetch new image
		updateLoader(true);
		updateTime();
		await updateQuoteAndBackground();
	} else {
		// If we have cached image, just update time and quote
		updateTime();
		const quotes = await fetchQuotes();
		const now = new Date();
		const start = new Date(now.getFullYear(), 0, 0);
		const diff = now - start;
		const oneDay = 1000 * 60 * 60 * 24;
		const dayOfYear = Math.floor(diff / oneDay);
		const quote = quotes[dayOfYear % quotes.length];
		document.getElementById("quote").textContent = quote;
	}

	const format12hr = document.getElementById("format12hr");
	const format24hr = document.getElementById("format24hr");

	if (format12hr && format24hr) {
		format12hr.checked = !is24HourFormat;
		format24hr.checked = is24HourFormat;

		format12hr.addEventListener("change", () => {
			if (format12hr.checked) {
				is24HourFormat = false;
				localStorage.setItem("is24HourFormat", is24HourFormat);
				updateTime();
			}
		});

		format24hr.addEventListener("change", () => {
			if (format24hr.checked) {
				is24HourFormat = true;
				localStorage.setItem("is24HourFormat", is24HourFormat);
				updateTime();
			}
		});
	} else {
		console.error("Time format toggle buttons not found");
	}

	const newImageButton = document.getElementById("newImageButton");
	if (newImageButton) {
		newImageButton.addEventListener("click", fetchAndUpdateImage);
	} else {
		console.error("New image button not found");
	}

	const newQuoteButton = document.getElementById("newQuoteButton");
	if (newQuoteButton) {
		newQuoteButton.addEventListener("click", fetchAndUpdateQuote);
	} else {
		console.error("New quote button not found");
	}

	const userNameInput = document.getElementById("userNameInput");
	if (userNameInput) {
		userNameInput.addEventListener("change", () => {
			const userName = userNameInput.value.trim();
			if (userName) {
				localStorage.setItem("userName", userName);
				updateTime();
			}
		});
	} else {
		console.error("User name input not found");
	}
});
