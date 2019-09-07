class CBQError extends Error {
	constructor(message, code = 500) {
		super(message);
		this.code = code;
	}
}

class CBQOperationNotSupportedError extends CBQError {
	constructor(op) {
		super(`Operation is not supported: ${op}`, 500);
		this.op = op;
	}

	static assert(handlers, op) {
		if (typeof handlers[op] !== 'function') {
			throw new CBQOperationNotSupportedError(op);
		}
	}
}

module.exports = {
	CBQError,
	CBQOperationNotSupportedError,
};
