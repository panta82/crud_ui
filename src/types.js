'use strict';

const { assertProvided, assertType } = require('./tools');

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
		this.helpText = undefined;

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

		assertProvided(this, 'name');
		assertType(this, 'name', 'string');

		assertProvided(this, 'label');
		assertType(this, 'label', 'string');

		assertType(this, 'helpText', 'string');
	}
}

class CBTexts {
	constructor(/** CBTexts */ source) {
		this.listNoData = 'No data';

		Object.assign(this, source);
	}
}

class CBCOptions {
	constructor(/** CBCOptions */ source) {
		/**
		 * List of fields that will constitute data. Each member must duck-type to CBCField interface.
		 * @type {CBCField[]}
		 */
		this.fields = undefined;

		/**
		 * Object describing all the texts that will be used in the application. Everything has defaults,
		 * but user is invited to overwrite some of them.
		 * @type {CBTexts}
		 */
		this.texts = undefined;

		/**
		 * Function to produce the list of items in list view
		 * @type {function():Array|Promise}
		 */
		this.list = undefined;

		Object.assign(this, source);
	}

	validateAndCoerce() {
		assertProvided(this, 'fields');
		assertType(this, 'fields', 'array');

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

		this.texts = new CBTexts(this.texts);

		assertProvided(this, 'list');
		assertProvided(this, 'list', 'function');
	}
}

module.exports = {
	CBC_FIELD_TYPES,
	CBCOptions,
	CBCField,
};
