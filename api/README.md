# **SadhguruQuoteGen - A custom wallpaper generator of sadhguru's daily quotes** #

## Project Overview ##
SadhguruQuoteGen is a Node.js-based automation tool that generates a daily wallpaper featuring Sadhguru’s quote and its corresponding background image directly from the official Isha Foundation website.

The script scrapes the daily quote and image, updates a local HTML template with this content, and uses Puppeteer to render and save a high-resolution wallpaper automatically.

## Features ##
- Automatically fetches the daily quote and wallpaper image from Sadhguru’s official site  
- Injects the fetched content into a custom HTML template  
- Renders a high-resolution wallpaper using Puppeteer  
- Supports specific date input (in DDMMYYYY format)  
- Saves the final wallpaper image locally  

## Installation
Run `npm install` to install dependencies.

However, by default, only `puppeteer-core` is going to be installed! You'd have 
to install your favorite browser(via puppeteer) yourself.

To install `Chrome`, run `npm run puppeteer-install-chrome`
To install `Firefox`, run `npm run puppeteer-install-firefox`

## Configuration
Run `cp .env.example .env`
TODO: Add proper env config details

## Running the program
Run the program with the following command

`npm run start-chrome` (this will tell puppeteer to use Chrome)
`npm run start-firefox` (this will tell puppeteer to use Firefox)

This will generate the wallpaper for the current date. Custom date can be
supplied too. The date should be supplied in `YYYY-MM-DD` format

For example,
`npm run start-chrome 2026-04-30`

## Tech Stack ##

- **Node.js** – runtime environment
- **Axios** – for making HTTP requests
- **Cheerio** – for parsing and traversing HTML
- **Puppeteer** – for headless Chromium rendering and screenshot generation
- **fs/promises** – for file operations

## How It Works ##

* Fetches the quote and background image from https://isha.sadhguru.org/en/wisdom/quotes/date/{date}
* Parses the HTML to extract the quote text and image URL.
* Encodes the image to Base64 and inserts both the quote and image into a predefined HTML template.
* Opens the updated template using Puppeteer in headless mode.
* Captures and saves a high-resolution screenshot as the daily wallpaper.

