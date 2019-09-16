'use strict';

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

/**
 * Take a slug-like string ("string_with_things") and convert it into a conversational string ("string with things")
 * @param str
 */
function deslugify(str) {
	return str.replace(/[_-]/g, ' ');
}

/**
 * Generate a random string token
 * @return {string}
 */
function randomToken() {
	return (
		Math.random()
			.toString(32)
			.slice(2) +
		Math.random()
			.toString(32)
			.slice(2)
	);
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

/**
 * Ensure string start swith leading char
 * @param leadingChar
 * @param str
 */
function ensureLeadingChar(leadingChar, str) {
	return typeof str === 'string' && str[0] !== leadingChar ? leadingChar + str : str;
}

/**
 * Cast an object into a constructor
 * @param Ctr
 * @param ob
 */
function cast(Ctr, ob) {
	if (ob instanceof Ctr) {
		return ob;
	}
	return new Ctr(ob);
}

// *********************************************************************************************************************

/**
 * Escape an arbitrary text into a form that can appear inside HTML.
 * @param str
 * @return {void | string | never}
 */
function escapeHTML(str) {
	return String(str).replace(/[&<>"']/g, m => ESCAPE_HTML_MAP[m]);
}

const ESCAPE_HTML_MAP = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#039;',
};

/**
 * Escape javascript code so that it can safely be embedded in a <script> tag.
 * https://stackoverflow.com/questions/14780858/escape-in-script-tag-contents
 * @param script
 */
function escapeScript(script) {
	return script ? script.replace(/<\/script/gm, '</scri\\pt') : '';
}

/**
 * Extract cookie value from a cookie header value (eg. "a=b; c=d"). Returns null if nothing is found.
 * @param {string} cookieStr
 * @param {string} cookieName
 * @return {string|null}
 */
function extractCookie(cookieStr, cookieName) {
	if (!cookieStr) {
		return null;
	}

	let startIndex = cookieStr.indexOf(cookieName);
	if (startIndex < 0) {
		return null;
	}

	while (cookieStr[startIndex] !== '=' && startIndex < cookieStr.length) {
		startIndex++;
	}
	startIndex++;
	let endIndex = startIndex;
	while (cookieStr[endIndex] !== ';' && endIndex < cookieStr.length) {
		endIndex++;
	}
	const value = cookieStr.slice(startIndex, endIndex);
	return value;
}

/**
 * Create a function that produces name if development and name.min.ext in production.
 * @param {string} name
 * @return {function(CUIContext)}
 */
function minInProd(name) {
	const dotIndex = name.lastIndexOf('.');
	const cleanName = name.substring(0, dotIndex);
	const extension = name.slice(dotIndex);
	return /** CUIContext */ ctx => {
		return ctx.options.isProduction ? cleanName + '.min' + extension : name;
	};
}

// *********************************************************************************************************************

module.exports = {
	capitalize,
	uncapitalize,
	pluralize,
	singularize,
	deslugify,
	randomToken,

	assertEqual,
	assertProvided,
	assertType,
	assertMember,
	makeObjectAsserters,

	isObject,
	getOrCall,
	ensureLeadingChar,
	cast,

	escapeHTML,
	escapeScript,
	extractCookie,
	minInProd,
};
