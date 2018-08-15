import fs from "fs";
import glob from "glob";
import chalk from "chalk";
import { transform } from "babel-core";

// Ramda functions
import R from "ramda";

import {
	toJSON,
	required,
	objectLength,
	relativePath,
	findDifference,
	beautifyMessages
} from "./utils";

class IntlCombiner {
	constructor({
		diffPath = required("diffPath"),
		locale = required("locale"),
		messages = required("messages")
	}) {
		this.diffFile = diffPath;
		this.localeFile = locale;
		this.messagesFile = messages;

		this.findedMessages = {};
		this.localeMessages = {};
		this.diffMessages = {};
	}

	/**
	 * saveMessages - Get and find Intl messages objects
	 */
	saveMessages(callback) {
		const srcPaths = glob.sync(this.messagesFile, { absolute: true });
		const contents = R.map(p => fs.readFileSync(p, "utf-8"), srcPaths);
		const messages = R.map(
			content =>
				transform(content, {
					presets: [require.resolve("babel-preset-react-app")],
					plugins: [require.resolve("babel-plugin-react-intl")],
					babelrc: false
				}),
			contents
		)
			.map(R.path(["metadata", "react-intl", "messages"]))
			.reduce(R.concat, []);

		// Make an object of the nessages array values
		var result = R.map(
			({ id, defaultMessage }) => ({ [id]: defaultMessage }),
			messages
		).reduce(R.merge, {});

		// Assign result in findedMessages varialble.
		this.findedMessages = result;
		callback && callback(null, this.findedMessages);

		return this;
	}
	/**
	 * [getDiff description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	getDiff(callback) {
		// Reading the old messages in locales folder
		let localeMessagesData = fs.readFileSync(this.localeFile, "utf8");
		// Assignment to local array of previous messages
		this.localeMessages = toJSON(localeMessagesData);
		// find diffrence of previous messages with all messages
		this.diffMessages = findDifference(
			this.localeMessages,
			this.findedMessages
		);

		callback && callback(null, this.diffMessages);

		return this;
	}

	/**
	 * Load Diff file content then save it to diffMessages variable.
	 * @return {Object} This object
	 */
	loadDiffs() {
		this.loadFile(this.diffFile, (errors, diffMessages) => {
			this.diffMessages = diffMessages;
		});

		return this;
	}
	/**
	 * Load locale file content then save it to locale and finded messages variable.
	 * @return {Object} This object
	 */
	loadLocale() {
		this.loadFile(this.localeFile, (errors, messages) => {
			this.localeMessages = messages;
			this.findedMessages = messages;
		});

		return this;
	}
	/**
	 * Load file
	 * @param  {String}   filePath Path to load your file.
	 * @param  {Function} callback
	 * @return {Object}            This object
	 */
	loadFile(filePath, callback) {
		// Load the diff messages file content
		let loadedFile = fs.readFileSync(filePath, "utf8");
		loadedFile = toJSON(loadedFile);

		callback && callback(null, loadedFile);

		return this;
	}

	/**
	 * saveDiff - Save Diff messages as a file.
	 * @return {Object} Beautified json string.
	 */
	saveDiff(file) {
		const diffFile = file || this.diffFile;
		const diffLength = objectLength(this.diffMessages);
		// Save diff(s) in file
		if (diffLength !== 0) {
			this.saveFile("saved", diffFile, this.diffMessages);

			console.log(
				"\n",
				chalk.white.bgGreen("Number of diffs:"),
				chalk.blue(objectLength(this.diffMessages))
			);
		} else {
			console.log(
				chalk.white.bgRed.bold("Warning:"),
				chalk.yellow("There is not any diffrences to find and saving")
			);
		}
		return this;
	}
	/**
	 * mergeDiff - Merge founded diff's messages with original messages file.
	 * @return {Object} this of class
	 */
	mergeDiff(callback) {
		if (objectLength(this.diffMessages) > 0) {
			const assignObjects = {
				...this.findedMessages,
				...this.diffMessages
			};
			// Save new assigned messages file
			this.saveFile("merged", this.localeFile, assignObjects);

			console.log(
				"\n",
				chalk.white.bgGreen("Number of diffs:"),
				chalk.blue(objectLength(this.diffMessages))
			);
		} else {
			console.log(
				chalk.yellow(
					"- Warning: The original messages file has not any diffrence with all messages file for merging!"
				)
			);
		}

		return this;
	}
	/**
	 * saveFile - Save messages in a file
	 * @return {Object} this of class
	 */
	saveFile(
		type,
		diffFileInput = null,
		messages = this.findedMessages,
		callback
	) {
		const diffFile = diffFileInput || this.diffFile;

		// Write Sync file
		fs.writeFile(diffFile, beautifyMessages(messages), err => {
			if (err) {
				console.log(chalk.white.bgRed.bold(err.message));

				callback && callback(err.message, null);
				return;
			}

			callback && callback(null, true);
			console.log(
				"\n",
				chalk.white.bgGreen(R.toUpper(type)),
				chalk.green(
					`${relativePath(this.messagesFile)} -> ${relativePath(
						diffFile
					)}`
				)
			);
		});

		return this;
	}
}

export default IntlCombiner;
