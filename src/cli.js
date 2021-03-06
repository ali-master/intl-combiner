#!/usr/bin/env node
import path from "path";
import { unlink } from "fs";
import program from "yargs";
import updateNotifier from "update-notifier";

import R from "ramda";
import chalk from "chalk";
import configrc from "./config";
import pkg, { version } from "../package.json";
import {
	validation,
	saveErrors,
	existLocale,
	displayError,
	relativePath,
	checkFileExists,
	ifArg as ifArgFunction
} from "./utils";
import IntlCombiner from "./combiner";

import help from "./lib/help";

(function(parser) {
	// wrap in IIFE to be able to use return
	const yargs = parser.usage(help);

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
			_: [eventType] // Merge or Save or Delete
		} = argv;
		if (validation(terminalConfig)) {
			terminalConfig = completeConfig(terminalConfig);

			if (validation(terminalConfig)) {
				if (showNotFoundErrors(terminalConfig.locales)) return false;

				if (
					existLocale(terminalConfig.findBy, terminalConfig.locales)
				) {
					const {
						findBy,
						locales,
						diffPath,
						messages
					} = terminalConfig;
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
				if (showNotFoundErrors(localConfig.locales)) return false;

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

	function showNotFoundErrors(list) {
		const errors = checkFileExists(list);
		if (!R.isEmpty(checkFileExists(list))) {
			console.log(
				chalk.yellow(
					"These following files don't exist, make sure you have written the right paths:"
				),
				"\n"
			);
			console.log(chalk.red(errors.join("\n")));
			return true;
		}

		return false;
	}

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

	updateNotifier({ pkg }).notify();
})(program);
