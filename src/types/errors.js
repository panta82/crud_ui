'use strict';

const { capitalize } = require('../tools');

class CUIError extends Error {
	constructor(message, code = 500) {
		super(message);
		this.code = code;
	}
}

class CUICSRFError extends CUIError {
	constructor() {
		super('Invalid or missing CSRF token. Reload and try again', 403);
	}
}

class CUIActionNotSupportedError extends CUIError {
	constructor(action) {
		super(`Action "${action}" is not supported`, 500);
		this.action = action;
	}

	static assert(handlers, op) {
		if (typeof handlers[op] !== 'function') {
			throw new CUIActionNotSupportedError(op);
		}
	}
}

// *********************************************************************************************************************

class CUIValidationFault {
	constructor(/** CUIValidationFault */ source) {
		/**
		 * Short error message, excluding key name
		 * @type {string}
		 */
		this.message = undefined;

		/**
		 * Field for which this error is
		 * @type {CUIField}
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
		return capitalize(this.field.title) + ' ' + this.message;
	}

	static cast(x) {
		return x instanceof CUIValidationFault ? x : new CUIValidationFault(x);
	}
}

class CUIValidationError extends CUIError {
	/**
	 * @param {CUIValidationFault[]} faults
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

		/** @type {CUIValidationFault[]} */
		this.faults = faults.map(f => CUIValidationFault.cast(f));

		/** @type {Object.<string, CUIValidationFault[]>} */
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
	CUIError,
	CUICSRFError,
	CUIActionNotSupportedError,
	CUIValidationFault,
	CUIValidationError,
};
