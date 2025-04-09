# spurgeon

# spurgeon

_"The Word of God is the anvil upon which the opinions of men are shattered."_ – Charles Spurgeon

Welcome to **A Moment With Spurgeon**, a Chrome extension that brings the timeless wisdom of Charles Spurgeon to your new tab every day. Start your day with a fresh quote, like the one above, from the "Prince of Preachers," paired with a stunning landscape image from Unsplash. Whether you're seeking inspiration, encouragement, or just a moment of reflection, this app delivers a personalized and uplifting experience every time you open a new tab.

## Features

- **Daily Quotes**: Displays a new Charles Spurgeon quote every day.
- **Random Images**: Fetches stunning landscape images from Unsplash.
- **Time Display**: Shows the current time in either 12-hour or 24-hour format.
- **User Personalization**: Allows users to input their name for a personalized greeting.
- **Dynamic Updates**: Buttons to fetch a new quote or image on demand.
- **Offline Fallback**: Provides a fallback image and quote in case of network issues.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Netlify Functions (serverless)
- **APIs**: Unsplash API for random images
- **Hosting**: Netlify

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/spurgeon.git
   cd spurgeon
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up the Unsplash API key:

   - Create a `.env` file in the root directory.
   - Add your Unsplash API key in the following format:
     ```
     UNSPLASH_API_KEY=your_api_key_here
     ```

4. Start a local development server:
   ```bash
   netlify dev
   ```

## Deployment

This app is designed to be deployed on Netlify. To deploy:

1. Push the code to your GitHub repository.
2. Connect your repository to Netlify.
3. Add the `UNSPLASH_API_KEY` environment variable in the Netlify dashboard.
4. Deploy the site.

## Usage

Install the Chrome extension by loading the unpacked extension:

1. Go to `chrome://extensions/`.
2. Enable "Developer mode."
3. Click "Load unpacked" and select the project folder.
4. Open a new tab to see the extension in action.

## File Structure

- `index.html`: Main HTML file for the extension.
- `styles.css`: Styling for the extension.
- `script.js`: JavaScript logic for fetching quotes, images, and updating the UI.
- `quotes.json`: A collection of Charles Spurgeon quotes.
- `netlify/functions/unsplash.js`: Serverless function for fetching random images from Unsplash.
- `manifest.json`: Chrome extension configuration.

## Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue for suggestions or bug reports.

## License

This project is licensed under the ISC License.

## Acknowledgments

- Charles Spurgeon for his timeless quotes.
- Unsplash for providing high-quality images.
- Netlify for hosting the app.
