import fs from "fs";
import path from "path";
import glob from "glob";

import babel from "babel-core";

// Ramda functions
import R from "ramda";

// Utilities
import size from "lodash.size";
import beautify from "json-beautify";

import { required, findDifference, log } from "./utils";

class IntlCombiner {
	constructor(
		pattern = required(),
		outFile = required(),
		baseMessagesFile = required()
	) {
		this.pattern = pattern;
		this.outFile = outFile;
		this.baseMessagesFile = baseMessagesFile;

		this.findedMessages = {};
		this.baseMessages = {};
		this.diffMessages = {};
	}
	/**
	 * getMessages - Get and find Intl messages object
	 * @return {Object} this of class.
	 */
	getMessages(type = "NEW") {
		const srcPaths = glob.sync(this.pattern, { absolute: true });
		const contents = R.map(p => fs.readFileSync(p, "utf-8"), srcPaths);
		const messages = R.map(
			content =>
				babel.transform(content, {
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

		if (type === "OLD") {
			// Reading the old messages in locales folder
			let currentDiffs = fs.readFileSync(this.outFile, "utf8");
			let baseFile = fs.readFileSync(this.baseMessagesFile, "utf8");
			// Assignment to local array of previous messages
			result = R.merge(this.toJSON(baseFile), this.toJSON(currentDiffs));
		}

		// Assign result in findedMessages varialble.
		this.findedMessages = result;

		return this;
	}
	getDiff() {
		// Reading the old messages in locales folder
		let baseMessagesData = fs.readFileSync(this.baseMessagesFile, "utf8");
		// Assignment to local array of previous messages
		this.baseMessages = this.toJSON(baseMessagesData);
		// find diffrence of previous messages with all messages
		this.diffMessages = findDifference(
			this.baseMessages,
			this.findedMessages
		);

		return this;
	}
	/**
	 * saveDiff - Save Diff messages as a file.
	 * @return {Object} Beautified json string.
	 */
	saveDiff(file) {
		const outFile = file || this.outFile;
		const diffLength = size(this.diffMessages);
		// Save diff(s) in file
		if (diffLength !== 0) {
			this.saveFile(outFile, this.diffMessages);

			log(
				"[IntlCombiner] Successfully created the diff file in:",
				outFile
			);
		} else {
			log(
				"[IntlCombiner] Warning: not found any diff(s) of messages for saving!"
			);
		}
		log("[IntlCombiner] Diff(s) length:", diffLength);

		return this;
	}
	/**
	 * mergeDiff - Merge founded diff's messages with original messages file.
	 * @return {Object} this of class
	 */
	mergeDiff() {
		if (size(this.diffMessages) !== 0) {
			// Assign objects with together with reset method in ES6.
			let assignObjects = {
				...this.findedMessages,
				...this.diffMessages
			};
			// Save new assigned messages file
			this.saveFile(this.baseMessagesFile, assignObjects);

			log("[IntlCombiner] New Diff(s) length:", size(this.diffMessages));
		} else {
			log(
				"[IntlCombiner] Warning: The original messages file has not any diffrence with all messages file for merging!"
			);
		}

		return this;
	}
	/**
	 * saveFile - Save messages in a file
	 * @return {Object} this of class
	 */
	saveFile(outFileInput = null, messages = this.findedMessages) {
		let outFile = outFileInput || this.outFile;

		// Write Sync file
		fs.writeFileSync(outFile, this.beautifyMessages(messages));

		log(
			`[IntlCombiner] Saved: ${path.relative(
				process.cwd(),
				this.pattern
			)} -> ${path.relative(process.cwd(), outFile)}`
		);

		return this;
	}
	/**
	 * beautifyMessages - Beautify rendered json file as indent and json styles.
	 * @return {Object} Beautified json string.
	 */
	beautifyMessages(messages) {
		return beautify(messages, null, 4, 160);
	}
	/**
	 * toJSON - Parse JSON as Sting
	 * @return {Object} Parsed JSON
	 */
	toJSON(ObjectStr) {
		return JSON.parse(ObjectStr);
	}
}

export default IntlCombiner;
