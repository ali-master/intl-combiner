import R from "ramda";
import path from "path";
import chalk from "chalk";
import { existsSync } from "fs";
import beautify from "js-beautify";

/**
 * Return a missing parameter error when the user did not mention the parameters in the function call.
 * @param  {String} parameter Parameter name.
 * @return {Function}         Return and throw an missing Error.
 */
export const required = parameter => {
	throw new Error(`Missing parameter: ${parameter}`);
};

/**
 * findDifference - Find diffrence of two object with together.
 * @param  {Object} locales
 * @param  {Object} all
 * @return {Object}
 */
export const findDifference = (locales, diffs) =>
	R.filter(
		diff => !R.has(diff)(locales) && !R.eqProps(diff, diffs, locales),
		R.keys(diffs)
	)
		.map(diff => ({ [diff]: diffs[diff] }))
		.reduce(R.merge, {});

/**
 * Validate all keys which that the intl-combiner need to use.
 * @param  {Array} locales  The list of all locales for use.
 * @param  {String} diffPath Path to save the diff file.
 * @param  {String} messages Path to all messages with glob method => ./src/ ** /messages.js
 * @param  {String} findBy   The goal locale which does you want to intl-combiner works on that like en or fa [this name should be the name of locale file in your locales list]
 * If you have 2 locales with this model:
 * [
 * 		{name: "en", path: "./src/locales/en.js"},
 * 		{name: "fr", path: "./src/locales/fr.js"}
 * ]
 * So, if you want to work on en.js, then you must set the "en" for this property by terminal or .combinerrc file.
 * @return {Boolean}          If there are no any errors the it will be returned true and vice versa.
 */
export function validation({ locales, diffPath, messages, findBy }) {
	return R.length(locales) > 0 && !R.isEmpty(messages) && !R.isEmpty(findBy);
}

/**
 * Get the list of errors which you have in your config or terminal commands.
 * All properties is the same of the validation function properties detailed.
 */
export function findErrors({ locales, diffPath, messages, findBy }) {
	const errors = [];

	R.length(locales) === 0 && errors.push("locales");
	R.isEmpty(messages) && errors.push("messages");
	R.isEmpty(findBy) && errors.push("findBy");

	return errors;
}

/**
 * Display errors in the terminal.
 * @param  {Array<String>} errors The list of errors names.
 */
export function displayError(errors) {
	console.error(
		`\n\u001b[1m\u001b[31mInsufficient number of arguments${
			!R.isEmpty(errors) ? ` or no ${R.join(" and ")(errors)}` : ""
		} found.`
	);
	console.error(
		"\u001b[1m\u001b[31mAlternatively, run 'intl-combiner --help' for usage info.\u001b[39m\u001b[22m\n"
	);
	process.exit(1);
}

/**
 * Check if the goal argument was used by the user in the terminal or not.
 * @param  {Array<Function>} argv
 * @return {Function}
 */
export function ifArg(argv) {
	return (name, fn, init) => {
		if (Array.isArray(argv[name])) {
			if (init) init();
			argv[name].forEach(fn);
		} else if (typeof argv[name] !== "undefined") {
			if (init) init();
			fn(argv[name], -1);
		}
	};
}

/**
 * toJSON - Parse JSON as Sting
 * @return {Object} Parsed JSON
 */
export function toJSON(ObjectStr) {
	return JSON.parse(ObjectStr);
}

/**
 * beautifyMessages - Beautify rendered json file as indent and json styles.
 * @return {Object} Beautified json string.
 */
export function beautifyMessages(messages) {
	return beautify.js(JSON.stringify(messages), {
		indent_size: "4",
		indent_char: " ",
		max_preserve_newlines: "5",
		preserve_newlines: true,
		keep_array_indentation: false,
		break_chained_methods: false,
		indent_scripts: "normal",
		brace_style: "collapse",
		space_before_conditional: true,
		unescape_strings: false,
		jslint_happy: false,
		end_with_newline: false,
		wrap_line_length: "0",
		indent_inner_html: false,
		comma_first: false,
		e4x: false
	});
}
/**
 * Return the object length
 * @param  {Object} object
 * @return {Number}        The length of object
 */
export function objectLength(object) {
	return R.length(R.keys(object));
}

export function relativePath(pth) {
	return path.relative(process.cwd(), pth);
}

export function checkExistLocaleByName(name, locales) {
	return !!R.find(R.propEq("name", name))(locales);
}

export function existLocale(name, locales) {
	if (checkExistLocaleByName(name, locales)) {
		return true;
	} else {
		console.log(
			chalk.white.bgRed.bold(
				`The ${name}.json file doesn't exist in your locales folder. please check it again.`
			)
		);

		process.exitCode = 2;

		return false;
	}
}

export function checkFileExists(list) {
	const notFoundList = [];

	R.forEach(
		({ name, path }) =>
			!existsSync(path) &&
			notFoundList.push(`${name} => ${relativePath(path)}`)
	)(list);

	return notFoundList;
}
