'use strict';

class CBCRecordDefinition {}

class CBCOptions {
	constructor(source) {
		/**
		 * @type {CBCRecordDefinition}
		 */
		this.record = undefined;

		Object.assign(this, source);
	}
}

module.exports = {
	CBCOptions,
	CBCRecordDefinition,
};
