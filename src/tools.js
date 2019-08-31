const libPluralize = require('pluralize');

function capitalize(str) {
	return str[0].toUpperCase() + str.slice(1);
}

function pluralize(str) {
	return libPluralize(str);
}

function singularize(str) {
	return libPluralize.singular(str);
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

function isObject(val) {
	return !!val && typeof val === 'object' && !Array.isArray(val);
}

/**
 * Very rudimentary template. Replaces $something and ${something} placeholders with given values.
 * Missing values are replaced with nothing. You can use \$ to get just $.
 * @param templateString
 * @param values
 */
function microTemplate(templateString, values) {
	let hasEscapes = false;
	const result = templateString.replace(
		/(?:\$([a-zA-Z][a-zA-Z0-9_]*)|\$\{([a-zA-Z][a-zA-Z0-9_]*)})/gm,
		(found, variant1, variant2, index) => {
			// If the variable is escaped, do not expand
			if (templateString[index - 1] === '\\') {
				hasEscapes = true;
				return found;
			}

			// Either variant1 or variant2 will contain the found variable, depending on the form ($var or ${var})
			const key = variant1 || variant2;
			const value = values[key] !== undefined ? values[key] : '';
			return value;
		}
	);

	if (!hasEscapes) {
		return result;
	}

	// Some $-s were escaped, so we want to do another pass and replace \$something with $something
	return result.replace(
		/\\(\$[a-zA-Z][a-zA-Z0-9_]*|\$\{[a-zA-Z][a-zA-Z0-9_]*})/gm,
		(_, content) => {
			return content;
		}
	);
}

module.exports = {
	capitalize,
	pluralize,
	singularize,

	assertProvided,
	assertType,
	assertMember,
	makeObjectAsserters,
	isObject,

	microTemplate,
};
