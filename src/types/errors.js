const { capitalize } = require('../tools');

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

// *********************************************************************************************************************

class CBQValidationFault {
	constructor(/** CBQValidationFault */ source) {
		/**
		 * Short error message, excluding key name
		 * @type {string}
		 */
		this.message = undefined;

		/**
		 * Field for which this error is
		 * @type {CBQField}
		 */
		this.field = undefined;

		/**
		 * Value that was validated
		 * @type {*}
		 */
		this.value = undefined;

		Object.assign(this, source);
	}

	get fullMessage() {
		return capitalize(this.field.label) + ' ' + this.message;
	}

	static cast(x) {
		return x instanceof CBQValidationFault ? x : new CBQValidationFault(x);
	}
}

class CBQValidationError extends CBQError {
	/**
	 * @param {CBQValidationFault[]} faults
	 * @param payload
	 */
	constructor(faults, payload) {
		let message;
		if (!faults || !faults.length) {
			message = 'Validation error';
			faults = [];
		} else if (typeof faults === 'string') {
			message = faults;
			faults = [];
		} else if (faults.length === 1) {
			message = `Validation error: ${faults[0].fullMessage}`;
		} else {
			message = `${faults.length} validation errors`;
		}
		super(message, 400);

		/** @type {CBQValidationFault[]} */
		this.faults = faults.map(f => CBQValidationFault.cast(f));

		/** @type {Object.<string, CBQValidationFault[]>} */
		this.byFieldName = this.faults.reduce((lookup, fault) => {
			lookup[fault.field.name] = lookup[fault.field.name] || [];
			lookup[fault.field.name].push(fault);
			return lookup;
		}, {});

		this.payload = payload;
	}
}

// *********************************************************************************************************************

module.exports = {
	CBQError,
	CBQActionNotSupportedError,
	CBQValidationFault,
	CBQValidationError,
};
