const axios = require("axios");

exports.handler = async function () {
	try {
		const response = await axios.get("https://api.unsplash.com/photos/random", {
			params: {
				query:
					"landscape scenery wilderness panorama mountains alpine mountain range mountain vista river lake ocean waterscape seascape forest woodland treeline green landscape fjord valley canyon coastal meadow scenic landscape nature panorama wilderness mountain forest river ocean view",
				orientation: "landscape",
				client_id: process.env.UNSPLASH_API_KEY, // Securely stored in Netlify
			},
		});

		return {
			statusCode: 200,
			body: JSON.stringify(response.data),
			headers: {
				"Access-Control-Allow-Origin": "*", // Allows requests from any domain
				"Content-Type": "application/json",
			},
		};
	} catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify({ message: "Failed to fetch image" }),
		};
	}
};
