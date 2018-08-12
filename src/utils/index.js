import R from "ramda";

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
 * @param  {Object} old
 * @param  {Object} all
 * @return {Object}
 */
export const findDifference = (old, all) =>
	R.filter(item => !R.has(item)(old), Object.keys(all))
		.map(item => ({ [item]: all[item] }))
		.reduce(R.merge, {});

export const log = (...message) => {
	console.log(...message);
};

/**
 * Has - Returns whether or not an array has a value with the specified name
 * @param  {String}  name Specified name for searching in array.
 * @return {Boolean}
 */
export function has(name) {
	return R.indexOf(name, process.argv) !== -1;
}
