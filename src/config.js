import fs from "fs";
import path from "path";
import findUp from "find-up";

let config;
let configFileNames = [".combinerrc", ".combinerrc.json", ".combinerrc.js"];
let configPath = findUp.sync(configFileNames);

if (path.basename(configPath).includes(".js")) {
	config = require(configPath);
} else {
	config = configPath ? JSON.parse(fs.readFileSync(configPath)) : {};
}

export default config;
