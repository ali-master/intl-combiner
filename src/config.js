import fs from "fs";
import path from "path";
import process from "process";

let config;

const configFileName = ".combinerrc";

export const getConfig = (
	existingConfig = config,
	readFile = fs.readFileSync,
	configPath = path.join(process.cwd(), configFileName)
) => {
	if (existingConfig) {
		return existingConfig;
	}

	try {
		config = JSON.parse(readFile(configPath, "utf-8"));
	} catch (e) {
		config = null;
	}

	return config;
};
