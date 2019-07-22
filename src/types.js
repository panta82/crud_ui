'use strict';

const CBC_FIELD_TYPES = {
	string: 'string',
	text: 'text',
	select: 'select',
};

class CBCField {
	constructor(/** CBCField */ source) {
		/**
		 * One of CBC_FIELD_TYPES-s
		 * @type {undefined}
		 */
		this.type = undefined;

		/**
		 * Name of the field, this will be mapped to a record key
		 * @type {string}
		 */
		this.name = undefined;

		/**
		 * Label to use in the form
		 * @type {string}
		 */
		this.label = undefined;

		/**
		 * Help text to display beneath the form. Optional.
		 * @type {string}
		 */
		this.help_text = undefined;

		Object.assign(this, source);
	}

	validateAndCoerce() {
		if (!CBC_FIELD_TYPES[this.type]) {
			throw new TypeError(
				`Field's "type" must be one of CBC_FIELD_TYPES (${Object.keys(CBC_FIELD_TYPES).join(
					', '
				)}). Instead given "${this.type}"`
			);
		}

		if (!this.name) {
			throw new TypeError(`Field's "name" is required`);
		}
		if (typeof this.name !== 'string') {
			throw new TypeError(`Field's "name" must be a string`);
		}

		if (!this.label) {
			throw new TypeError(`Field's "label" is required`);
		}
		if (typeof this.label !== 'string') {
			throw new TypeError(`Field's "label" must be a string`);
		}
	}
}

class CBCOptions {
	constructor(/** CBCOptions */ source) {
		/**
		 * @type {CBCField[]}
		 */
		this.fields = undefined;

		Object.assign(this, source);
	}

	validateAndCoerce() {
		if (!this.fields) {
			throw new TypeError(`"fields" must be provided`);
		}
		if (!Array.isArray(this.fields)) {
			throw new TypeError(`"fields" must be an array`);
		}
		if (this.fields.length < 1) {
			throw new TypeError(`"fields" must have at least one field supplied`);
		}

		this.fields = this.fields.map((field, index) => {
			if (typeof field !== 'object') {
				throw new TypeError(
					`Invalid field #${index}: It must be an object, instead given "${typeof field}"`
				);
			}

			field = new CBCField(field);
			try {
				field.validateAndCoerce();
			} catch (err) {
				throw new TypeError(`Invalid field #${index}: ${err.message}`);
			}
			return field;
		});
	}
}

module.exports = {
	CBC_FIELD_TYPES,
	CBCOptions,
	CBCField,
};
