function assertProvided(target, key) {
	if (target[key] === undefined) {
		throw new TypeError(`Key "${key}" must be provided`);
	}
}

function assertType(target, key, ...types) {
	if (target[key] === undefined) {
		return;
	}

	const actual = Array.isArray(target[key]) ? 'array' : typeof target[key];

	if (!types.includes(actual)) {
		throw new TypeError(
			`Key "${key}" must be of type ${types.join(' or ')}. Instead given "${actual}"`
		);
	}
}

module.exports = {
	assertProvided,
	assertType,
};
