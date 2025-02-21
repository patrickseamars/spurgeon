const axios = require('axios')

exports.handler = async function () {
	try {
		const response = await axios.get('https://api.unsplash.com/photos/random', {
			params: {
				query: 'nature, cityscape',
				orientation: 'landscape',
				client_id: process.env.UNSPLASH_API_KEY // Securely stored in Netlify
			}
		})

		return {
			statusCode: 200,
			body: JSON.stringify(response.data),
			headers: {
				'Access-Control-Allow-Origin': '*', // Allows requests from any domain
				'Content-Type': 'application/json'
			}
		}
	} catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify({ message: 'Failed to fetch image' })
		}
	}
}
