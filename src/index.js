const fs = require("node:fs/promises");
const {execSync} = require("child_process");
const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

const config = require("./config.js");

const monthNames = [ "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december" ]

/**
 * Hack: Parse out the Hero Image URL from the Page script
 */
async function parseHeroImageUrl(cheerioPageHtml)
{
	try {
		// extracting the script '#__NEXT_DATA__' for parsing the image url
		const pageScript = cheerioPageHtml("#__NEXT_DATA__").html();

		// cleaning the invalid json in the script html for successful json parsing
		const pageLinkDataStr = pageScript
			.replace(/,\s*}/g, "}")
			.replace(/,\s*]/g, "]")
			.replace(/]\s*"\s*seoKeywords"/g, '], "seoKeywords"');

		const pageLinkData = JSON.parse(pageLinkDataStr);
		// parsing the image url from the json
		return pageLinkData.props.pageProps.pageDataDetail.heroImage[0].value.url;
    } catch (err) {
		throw new Error(`ParseHeroImage failed: ${err.message}`);
	}
}

async function loadImage(imageUrl)
{
	try {
		const image           = await axios.get(imageUrl, { responseType: "arraybuffer" });
		const imageBase64     = Buffer.from(image.data).toString("base64");
		return imageBase64;
	} catch (err) {
		throw new Error(`LoadImage failed: ${err.message}`);
	}
}

async function getQuoteInfo(date)
{
	try {
		const url = `https://isha.sadhguru.org/en/wisdom/quotes/date/${date}`
		const response = await axios.get(url);

		const cheerioPageHtml = cheerio.load(response.data.toString());
		const title           = cheerioPageHtml('.css-1cw0rco').text();
		const imageUrl        = await parseHeroImageUrl(cheerioPageHtml);

		const imageBase64     = await loadImage(imageUrl);

		return {
			title,
			imageBase64,
		};
	} catch (err) {
		if (err.status === 404) {
			throw new Error("GetQuoteInfo failed: Quote not generated! Try different date");
		}
		throw new Error(`GetQuoteInfo failed: ${err.message}`);
	}
}

async function buildHtmlFromTemplate(title, imageDataBase64)
{
	try {
		const templateContents = await fs.readFile(config.TEMPLATE_FILEPATH, {encoding: "utf-8"});

		// hydrate template placeholders with relevant values
		const templateFileData = templateContents
			.replace("paragraph", title)
			.replace("screenshot.png", `data:image/png;base64,${imageDataBase64}`);

		// store the HTML file built from the template
		const outputPath = "/tmp/sadhguru-quote-gen-output.html";
		await fs.writeFile(outputPath, templateFileData)

		return outputPath;
	} catch (err) {
		throw new Error(`BuildHtmlFromTemplate failed: ${err.message}`);
	}
}

async function screenshotHtml(htmlFilepath, width, height)
{
	try {
		const screenshotPath = "/tmp/sadhguru-quote-gen-screenshot.png";
		const browser = await puppeteer.launch({ headless: true });
		const page = await browser.newPage();
		await page.goto(htmlFilepath, { waitUntil: "load" });
		await page.setViewport({ width, height });
		await page.screenshot({ path: screenshotPath });
		await browser.close();
		return screenshotPath;
	} catch (err) {
		throw new Error(`ScreenshotHtml failed: ${err.message}`);
	}
}

function parseDate(userInput)
{
	if (userInput) {
		const [year, monthNum, date] = userInput.split("-").map(el => Number(el));
		const month = monthNames[monthNum - 1];
		if (!year || year < 0) {
			throw new Error(`ParseDate failed: ${userInput}: Invalid year value`);
		}
		if (!monthNum || monthNum < 1 || monthNum > 12) {
			throw new Error(`ParseDate failed: ${userInput}: Invalid month value`);
		}
		if (!date || date < 1 || date > 31) {
			throw new Error(`ParseDate failed: ${userInput}: Invalid date value`);
		}

		return `${month}-${date}-${year}`;
	}

	let currentDate = new Date();
	let date = currentDate.getDate();
	let month = monthNames[currentDate.getMonth()];
	let year = currentDate.getFullYear();
	if (date <= 9) {
		date = `0${date.toString()}`
	}
	return `${month}-${date}-${year}`;
}

async function start()
{
	try {
		const inputDate				 = parseDate(process.argv[2]);
		const { title, imageBase64 } = await getQuoteInfo(inputDate);
		const htmlFilepath			 = await buildHtmlFromTemplate(title, imageBase64);
		const screenshotPath         = await screenshotHtml(`file://${htmlFilepath}`, config.WALLPAPER_WIDTH, config.WALLPAPER_HEIGHT);

		const afterCommand			 = config.AFTER_COMMAND.replace("{}", screenshotPath);
		const execCommand  			 = `sh -c "${afterCommand}"`;

		execSync(execCommand, { stdio: "ignore" });
	} catch (err) {
		console.log(`SadhguruWallpaperGen failed: ${err.message}`);
	}
}

start();
