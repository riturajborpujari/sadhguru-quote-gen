const fs = require("fs");
require("dotenv").config({ quiet: true })

const config = {
	TEMPLATE_FILEPATH: process.env.TEMPLATE_FILEPATH,
	WALLPAPER_WIDTH: Number(process.env.WALLPAPER_WIDTH) || 1920,
	WALLPAPER_HEIGHT: Number(process.env.WALLPAPER_HEIGHT) || 1080,
	AFTER_COMMAND: process.env.AFTER_COMMAND || "cp {} ~",
}

if (!fs.existsSync(config.TEMPLATE_FILEPATH)) {
	throw new Error(`Config load failed: TEMPLATE_FILEPATH(${config.TEMPLATE_FILEPATH}) does not exist`);
}

module.exports = config;
