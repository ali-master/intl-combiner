module.exports = function(yargs) {
	yargs
		.help("help")
		.alias("help", "h")
		.version()
		.alias("version", "v")
		.options({
			config: {
				type: "string",
				describe: "Path to the config file",
				defaultDescription: ".combinerrc",
				requiresArg: true
			},
			context: {
				type: "string",
				alias: "c",
				describe:
					"The base directory, an absolute path, for resolving entry points and loaders from configuration.",
				requiresArg: true
			},
			locale: {
				type: "array",
				alias: "l",
				describe: "The list of Locales paths and names",
				requiresArg: true
			},
			"diff-path": {
				type: "string",
				alias: "d",
				describe: "Path to save diff file after generating.",
				requiresArg: true
			},
			messages: {
				type: "string",
				alias: "m",
				describe:
					"Path to the messages files. this string inlcudes glob model",
				requiresArg: true
			}
		});
};
