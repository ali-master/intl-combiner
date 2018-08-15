#!/usr/bin/env node
import { unlink } from "fs";
import path from "path";
import program from "yargs";

import R from "ramda";
import chalk from "chalk";
import configrc from "./config";
import { version } from "../package.json";
import {
	validation,
	saveErrors,
	existLocale,
	displayError,
	relativePath,
	ifArg as ifArgFunction
} from "./utils";
import IntlCombiner from "./combiner";

(function(parser) {
	// wrap in IIFE to be able to use return
	const yargs = parser.usage(`Intl-combiner ${version}
Usage: intl-combiner [options]
       intl-combiner [options] save --local <name:path> --findBy <findBy>
       intl-combiner [options] merge --local <name:path> --diff-path <diff-path>
       intl-combiner [options] delete
       intl-combiner <command> [options]

Example: intl-combiner save --context ./src/ --locale en:locales/en.js --locale fr:locales/fr.js --findBy en --messages **/messages.js

For more information, see https://github.com/ali-master/intl-combiner.`);

	require("./config-yargs")(yargs);

	yargs
		.command(
			["save", "$0"],
			"Find diffs between your findBy property value with current messages in the application."
		)
		.help();

	yargs
		.command(
			["merge", "$0"],
			"Merge diffs with your locale file which you have put it by findBy property via by terminal or combinerrc file."
		)
		.help();

	yargs.command(["delete", "$0"], "delete the created diff file").help();

	// yargs will terminate the process early when the user uses help or version.
	// This causes large help outputs to be cut short (https://github.com/nodejs/node/wiki/API-changes-between-v0.10-and-v4#process).
	// To prevent this we use the yargs.parse API and exit the process normally
	yargs.parse(process.argv.slice(2), (err, argv, output) => {
		Error.stackTraceLimit = 30;
		let terminalConfig = {
			locales: [],
			findBy: "",
			context: "",
			diffPath: "",
			messages: ""
		};

		// arguments validation failed
		if (err && output) {
			console.error(output);
			process.exitCode = 1;
			return;
		}

		// help or version info
		if (output) {
			console.log(output);
			return;
		}

		const ifArg = ifArgFunction(argv);

		ifArg("locale", locale => {
			if (locale.includes(":")) {
				const [name, path] = locale.split(":");
				terminalConfig.locales.push({ name, path });
			}
		});

		ifArg("context", context => {
			if (context) {
				terminalConfig.context = context;
			}
		});

		ifArg("diff-path", diffPath => {
			if (diffPath) {
				terminalConfig.diffPath = diffPath;
			}
		});

		ifArg("messages", messages => {
			if (messages) {
				terminalConfig.messages = messages;
			}
		});

		ifArg("findBy", findBy => {
			if (findBy) {
				terminalConfig.findBy = findBy;
			}
		});

		function completeConfig(config) {
			function join(lastPath) {
				// Global system address by using the process.cwd() native function
				return path.join(process.cwd(), config.context, lastPath);
			}
			if (config.context) {
				config.locales = R.map(locale => {
					locale.path = join(locale.path);

					return locale;
				})(config.locales);
				config.messages = join(config.messages);
				if (config.diffPath) {
					config.diffPath = join(config.diffPath);
				} else {
					config.diffPath =
						path.dirname(config.locales[0].path) + "/diff.json";
				}
			} else {
				// No context found
				if (!config.diffPath && !R.isEmpty(config.locales)) {
					config.diffPath =
						path.dirname(config.locales[0].path) + "/diff.json";
				}
			}

			return config;
		}

		const {
			_: [eventType] // Merge or save
		} = argv;
		if (validation(terminalConfig)) {
			terminalConfig = completeConfig(terminalConfig);

			if (validation(terminalConfig)) {
				if (
					existLocale(terminalConfig.findBy, terminalConfig.locales)
				) {
					const {
						findBy,
						locales,
						diffPath,
						messages
					} = terminalConfig;
					const locale = R.save(R.propEq("name", findBy))(locales)
						.path;

					const combiner = new IntlCombiner({
						messages,
						diffPath,
						locale
					});

					if (eventType === "save") {
						combiner
							.saveMessages()
							.getDiff()
							.saveDiff();
					} else if (eventType === "merge") {
						combiner
							.loadDiffs()
							.loadLocale()
							.mergeDiff();
					} else if (eventType === "delete") {
						deleteFile(diffPath);
					}
				}
			} else {
				displayError(saveErrors(terminalConfig));
			}
		} else {
			let localConfig = {
				...configrc,
				...R.filter(value => !R.isEmpty(value))(terminalConfig)
			};
			localConfig = completeConfig(localConfig);
			// console.log("localConfig", localConfig);

			if (validation(localConfig)) {
				if (existLocale(localConfig.findBy, localConfig.locales)) {
					const { messages, diffPath, locales, findBy } = localConfig;
					const locale = R.find(R.propEq("name", findBy))(locales)
						.path;

					const combiner = new IntlCombiner({
						messages,
						diffPath,
						locale
					});

					if (eventType === "save") {
						combiner
							.saveMessages()
							.getDiff()
							.saveDiff();
					} else if (eventType === "merge") {
						combiner
							.loadDiffs()
							.loadLocale()
							.mergeDiff();
					} else if (eventType === "delete") {
						deleteFile(diffPath);
					}
				}
			} else {
				displayError(saveErrors(localConfig));
			}
		}
	});

	function deleteFile(file) {
		unlink(file, err => {
			if (err) {
				console.log(chalk.white.bgRed.bold(err.message));

				return;
			}
			console.log(
				chalk.white.bgGreen.bold(
					"successfully deleted ",
					relativePath(file)
				)
			);
		});
	}
})(program);
