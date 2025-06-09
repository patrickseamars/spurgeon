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
			const randomImage =
				storedImages[Math.floor(Math.random() * storedImages.length)];
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
		applyFallbackImage();
	}
}

function applyFallbackImage() {
	const fallbackImageURL = chrome.runtime.getURL(
		"garrett-parker-DlkF4-dbCOU-unsplash.jpg"
	);
	applyBackgroundImage({
		url: fallbackImageURL,
		photographer: "Garrett Parker",
		photographerUrl: "https://unsplash.com/@garrettpsystems",
		location: "Moraine Lake, Canada",
	});
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
		const response = await fetch("data/quotes.json");
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

async function fetchDevotionals() {
	try {
		const response = await fetch("data/morning_and_evening.json");
		if (!response.ok) throw new Error("Failed to load devotionals");
		const devotionals = await response.json();
		return devotionals;
	} catch (error) {
		console.error("Error fetching devotionals:", error);
		return null;
	}
}

async function updateDevotional() {
	try {
		const response = await fetch("data/morning_and_evening.json");
		if (!response.ok) {
			throw new Error("Failed to fetch devotionals");
		}
		const devotionals = await response.json();

		const now = new Date();
		const isEvening = now.getHours() >= 17; // After 5pm

		// Convert current date to "Month Day" format
		const months = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		];
		const dateKey = `${months[now.getMonth()]} ${now.getDate()}`;

		// Find today's devotional
		const todayDevotional = devotionals.find((d) => d.date === dateKey);

		if (!todayDevotional) {
			throw new Error("No devotional found for today");
		}

		// Select morning or evening devotional
		const devotional = isEvening
			? todayDevotional.evening
			: todayDevotional.morning;

		// Update the DOM
		const devotionalContent = document.getElementById("devotionalContent");
		if (!devotionalContent) {
			throw new Error("Devotional content element not found");
		}

		devotionalContent.innerHTML = `
			<h2>${dateKey}</h2>
			<h3 class="devotional-date">${isEvening ? "Evening" : "Morning"} Devotional</h3>
			<blockquote class="devotional-verse"><em>${devotional.verse}</em></blockquote>
			<hr style="border: 1px solid #ccc; width: 50%;">
			<p class="devotional-text">${devotional.content}</p>
		`;
	} catch (error) {
		console.error("Error updating devotional:", error);
		// Show fallback content
		const devotionalContent = document.getElementById("devotionalContent");
		if (devotionalContent) {
			devotionalContent.innerHTML = `
				<h2>Devotional Temporarily Unavailable</h2>
				<p>Please try again later. If the problem persists, you may need to refresh the page.</p>
			`;
		}
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
		isEvening = true;
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
	try {
		const storedImages = JSON.parse(localStorage.getItem("images") || "[]");
		const today = new Date().toDateString();
		const storedDate = localStorage.getItem("imageDate");

		if (storedDate === today && storedImages.length > 0) {
			const img = new Image();
			img.src = storedImages[0]?.urls?.regular || "";

			img.onerror = () => {
				background.style.opacity = "1";
			};
			return true;
		}
		return false;
	} catch (error) {
		console.error("Error in preloadImage:", error);
		return false;
	}
}

async function init() {
	initializeLoader();
	await loadBackgroundImage();
	updateTime();
	updateQuote();
	updateDevotional();
	handleTabEvents();

	// Set up time update intervals
	setInterval(updateTime, 1000);
	setInterval(updateQuote, 3600000); // Update every hour
	setInterval(updateDevotional, 3600000); // Update every hour

	// Initialize devotional drawer
	initializeDevotionalDrawer();
}

function handleTabEvents() {
	if (chrome?.tabs) {
		chrome.tabs.onActivated.addListener(async (activeInfo) => {
			// Refresh content when tab becomes active
			const tab = await chrome.tabs.get(activeInfo.tabId);
			if (tab.url === "chrome://newtab/") {
				updateTime();
				updateDevotional();
			}
		});

		chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
			// Handle tab updates
			if (changeInfo.status === "complete" && tab.url === "chrome://newtab/") {
				console.log("New tab page fully loaded");
			}
		});
	}
}

function initializeDevotionalDrawer() {
	const devotionalToggle = document.getElementById("devotionalToggle");
	const devotionalDrawer = document.getElementById("devotionalDrawer");
	const closeDrawer = document.getElementById("closeDrawer");

	// Guard clause to prevent errors if elements don't exist
	if (!devotionalToggle || !devotionalDrawer || !closeDrawer) {
		console.error("Required drawer elements not found");
		return;
	}

	// Initialize drawer state
	devotionalDrawer.style.display = "none";
	devotionalDrawer.style.position = "fixed";
	devotionalDrawer.style.bottom = "0";
	devotionalDrawer.style.left = "0";
	devotionalDrawer.style.right = "0";
	devotionalDrawer.style.zIndex = "1000";
	devotionalDrawer.style.transition = "all 0.3s ease";
	devotionalDrawer.style.background = "rgba(0, 0, 0, 0.8)";
	devotionalDrawer.style.overflow = "hidden";
	devotionalDrawer.style.height = "0";

	// Toggle drawer
	devotionalToggle.addEventListener("click", () => {
		if (devotionalDrawer.style.display === "none") {
			devotionalDrawer.style.display = "block";
			setTimeout(() => {
				devotionalDrawer.style.height = "70vh";
			}, 10);
		} else {
			devotionalDrawer.style.height = "0";
			setTimeout(() => {
				devotionalDrawer.style.display = "none";
			}, 300);
		}
	});

	// Close drawer
	closeDrawer.addEventListener("click", () => {
		devotionalDrawer.style.height = "0";
		setTimeout(() => {
			devotionalDrawer.style.display = "none";
		}, 300);
	});

	// Handle click outside drawer
	document.addEventListener("click", (e) => {
		if (
			!devotionalDrawer.contains(e.target) &&
			!devotionalToggle.contains(e.target)
		) {
			devotionalDrawer.style.height = "0";
			setTimeout(() => {
				devotionalDrawer.style.display = "none";
			}, 300);
		}
	});
}

// Add this function before the init() function
async function updateQuote() {
	const quotes = await fetchQuotes();
	const now = new Date();
	const start = new Date(now.getFullYear(), 0, 0);
	const diff = now - start;
	const oneDay = 1000 * 60 * 60 * 24;
	const dayOfYear = Math.floor(diff / oneDay);
	const quote = quotes[dayOfYear % quotes.length];

	if (quote) {
		document.getElementById("quote").textContent = quote;
		localStorage.setItem("lastQuote", quote);
	}
}

document.addEventListener("DOMContentLoaded", async () => {
	// Wait for all required DOM elements before proceeding
	const requiredElements = ["time", "quote", "devotionalContent", "background"];

	const missing = requiredElements.filter((id) => !document.getElementById(id));
	if (missing.length > 0) {
		console.error("Missing required DOM elements:", missing);
		return;
	}

	await init();
});

document.addEventListener("DOMContentLoaded", async () => {
	// First try to preload cached image
	const hasCachedImage = await preloadImage();

	if (!hasCachedImage) {
		// If no cached image, show loader and fetch new image
		updateLoader(true);
		await updateQuoteAndBackground();
	} else {
		// If we have cached image, just update time and quote
		updateTime();
		updateQuote();
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

	// Set favicon dynamically
	const favicon = document.getElementById("favicon");
	if (favicon) {
		try {
			if (typeof chrome !== "undefined" && chrome.runtime) {
				// Running as Chrome extension
				favicon.href = chrome.runtime.getURL("icons/icon16.png");
			} else {
				// Running locally
				favicon.href = "icons/icon16.png";
			}
		} catch (error) {
			console.error("Error setting favicon:", error);
			favicon.href = "icons/icon16.png";
		}
	}
});

function safeGetStorage(key, defaultValue = null) {
	try {
		const value = localStorage.getItem(key);
		return value ? JSON.parse(value) : defaultValue;
	} catch (error) {
		console.error(`Error reading ${key} from storage:`, error);
		return defaultValue;
	}
}

function safeSetStorage(key, value) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
		return true;
	} catch (error) {
		console.error(`Error writing ${key} to storage:`, error);
		return false;
	}
}

async function fetchLocalResource(filename) {
	try {
		const response = await fetch(chrome.runtime.getURL(filename));
		if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
		return await response.json();
	} catch (error) {
		console.error(`Error loading ${filename}:`, error);
		return null;
	}
}

function handleImageError(imgElement) {
	imgElement.onerror = null; // Prevent infinite loop
	imgElement.src = "icons/icon128.png"; // Fallback image
}

// Add error handlers to your images
document.querySelectorAll("img").forEach((img) => {
	img.onerror = () => handleImageError(img);
});

// Add to the top of the file with other permissions
if (!chrome?.tabs) {
	console.warn("chrome.tabs API not available");
}
