class CBQError extends Error {
	constructor(message, code = 500) {
		super(message);
		this.code = code;
	}
}

class CBQActionNotSupportedError extends CBQError {
	constructor(action) {
		super(`Action "${action}" is not supported`, 500);
		this.action = action;
	}

	static assert(handlers, op) {
		if (typeof handlers[op] !== 'function') {
			throw new CBQActionNotSupportedError(op);
		}
	}
}

module.exports = {
	CBQError,
	CBQActionNotSupportedError,
};
