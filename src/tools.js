const libPluralize = require('pluralize');

function capitalize(str) {
	return str[0].toUpperCase() + str.slice(1);
}

function uncapitalize(str) {
	return str[0].toLowerCase() + str.slice(1);
}

function pluralize(str) {
	return libPluralize(str);
}

function singularize(str) {
	return libPluralize.singular(str);
}

// *********************************************************************************************************************

function assertEqual(value, expected, identifier = 'value') {
	if (value !== expected) {
		throw new TypeError(`Expected ${identifier} to be "${expected}", instead got "${value}"`);
	}
}

function assertProvided(value, identifier) {
	if (value === undefined) {
		throw new TypeError(`${identifier} must be provided`);
	}
}

function assertType(value, identifier = 'Type', ...types) {
	if (value === undefined) {
		// Pass through undefined, use assertProvided for those
		return;
	}

	const actual = Array.isArray(value) ? 'array' : typeof value;

	if (!types.includes(actual)) {
		throw new TypeError(
			`${identifier} must be ${types.join(' or ')}. Instead, we were given "${actual}"`
		);
	}
}

function assertMember(value, hash, identifier = 'Value') {
	if (!(value in hash)) {
		const keys = Object.keys(hash).map(k => '"' + k + '"');
		let keysStr;
		if (keys.length <= 1) {
			keysStr = keys[0];
		} else {
			keysStr =
				'one of ' + keys.slice(0, keys.length - 1).join(', ') + ' or ' + keys[keys.length - 1];
		}
		throw new TypeError(`${identifier} must be ${keysStr}. Instead, we were given "${value}"`);
	}
}

function makeObjectAsserters(object, identifierPrefix = 'Key "', identifierSuffix = '"') {
	return {
		provided: key => assertProvided(object[key], identifierPrefix + key + identifierSuffix),
		type: (key, ...types) =>
			assertType(object[key], identifierPrefix + key + identifierSuffix, ...types),
		member: (key, hash) =>
			assertMember(object[key], hash, identifierPrefix + key + identifierSuffix),
	};
}

// *********************************************************************************************************************

function isObject(val) {
	return !!val && typeof val === 'object' && !Array.isArray(val);
}

/**
 * If val is function, call it with args and return the result. Otherwise, just return the val.
 * This is used for function-or-literal pattern for some options.
 * @param {function|*} val
 * @param args
 */
function getOrCall(val, ...args) {
	if (typeof val === 'function') {
		return val(...args);
	}
	return val;
}

module.exports = {
	capitalize,
	uncapitalize,
	pluralize,
	singularize,

	assertEqual,
	assertProvided,
	assertType,
	assertMember,
	makeObjectAsserters,

	isObject,
	getOrCall,
};
