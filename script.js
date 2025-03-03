async function fetchQuotes() {
	try {
		const response = await fetch("quotes.json");
		if (!response.ok) throw new Error("Failed to load quotes");
		return await response.json();
	} catch (error) {
		console.error("Error fetching quotes:", error);
		return [
			"A Bible that’s falling apart usually belongs to someone who isn’t.",
		];
	}
}

async function fetchRandomImage() {
	const url =
		"https://melodious-dusk-d264c9.netlify.app/.netlify/functions/unsplash";
	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error("Failed to load image");
		const data = await response.json();
		return data || "";
	} catch (error) {
		console.error("Error fetching image:", error);
		return "https://via.placeholder.com/1600x900?text=Error+loading+image";
	}
}

function hideLoader() {
	document.getElementById("loader").classList.add("hidden");
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
	const storedImageURL = localStorage.getItem("lastImageUrl");
	const storedPhotog = localStorage.getItem("lastImagePhotog");
	const storedPhotogLink = localStorage.getItem("lastImagePhotogLink");
	const storedLocation = localStorage.getItem("lastImageLocation");
	const storedQuote = localStorage.getItem("lastQuote");

	let imageURL, photog, photogLink, location;

	if (storedDate === today && storedImageURL) {
		console.log("Using stored image and quote");
		imageURL = storedImageURL;
		photog = storedPhotog;
		photogLink = storedPhotogLink;
		location = storedLocation;
		document.getElementById("quote").textContent = storedQuote || quote;
	} else {
		const image = await fetchRandomImage();
		imageURL = image.urls.full;
		photog = image.user.name;
		photogLink = image.user.links.html;
		location = image.location.name;

		localStorage.setItem("lastImageDate", today);
		localStorage.setItem("lastImageUrl", imageURL);
		localStorage.setItem("lastImagePhotog", photog);
		localStorage.setItem("lastImagePhotogLink", photogLink);
		localStorage.setItem("lastImageLocation", location);
		localStorage.setItem("lastQuote", quote);
		document.getElementById("quote").textContent = quote;
	}

	const img = new Image();
	img.src = imageURL;
	img.onload = () => {
		document.getElementById(
			"background"
		).style.backgroundImage = `url(${imageURL})`;
		document.getElementById("photog").textContent = photog;
		document.getElementById(
			"photog"
		).href = `${photogLink}?utm_source=a_moment_of_spurgeon&utm_medium=referral`;
		document.getElementById("photoLink").href = imageURL;
		document.getElementById("location").textContent = location;

		document.querySelector(".container").style.display = "block";
		hideLoader();
	};

	document.getElementById("loader").classList.remove("hidden");
	document.querySelector(".container").style.display = "none";
}

async function fetchAndUpdateImage() {
	const today = new Date().toISOString().split("T")[0];
	const image = await fetchRandomImage();
	const imageURL = image.urls.full;
	const photog = image.user.name;
	const photogLink = image.user.links.html;
	const location = image.location.name;

	localStorage.setItem("lastImageDate", today);
	localStorage.setItem("lastImageUrl", imageURL);
	localStorage.setItem("lastImagePhotog", photog);
	localStorage.setItem("lastImagePhotogLink", photogLink);
	localStorage.setItem("lastImageLocation", location);

	const img = new Image();
	img.src = imageURL;
	img.onload = () => {
		document.getElementById(
			"background"
		).style.backgroundImage = `url(${imageURL})`;
		document.getElementById("photog").textContent = photog;
		document.getElementById(
			"photog"
		).href = `${photogLink}?utm_source=a_moment_of_spurgeon&utm_medium=referral`;
		document.getElementById("photoLink").href = imageURL;
		document.getElementById("location").textContent = location;

		document.querySelector(".container").style.display = "block";
		hideLoader();
	};

	document.getElementById("loader").classList.remove("hidden");
	document.querySelector(".container").style.display = "none";
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
		document.getElementById(
			"time"
		).textContent = `${hours}:${minutes} ${period}`;
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
		document.getElementById(
			"timeOfDay"
		).textContent = `${timeOfDay}, ${userName}`;
		document.getElementById("userNamePrompt").style.display = "none";
		document.getElementById("userNameInput").style.display = "none";
	} else {
		document.getElementById("timeOfDay").textContent = timeOfDay;
		document.getElementById("userNamePrompt").style.display = "inline";
		document.getElementById("userNameInput").style.display = "inline";
	}
}

document.addEventListener("DOMContentLoaded", () => {
	hideLoader();

	setInterval(updateTime, 1000);
	updateTime();
	updateQuoteAndBackground();

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
