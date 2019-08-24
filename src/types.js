'use strict';

const { assertType, makeObjectAsserters, capitalize, pluralize } = require('./tools');
const { CBQViews } = require('./views');
const { CBQTexts } = require('./texts');

const CBQ_FIELD_TYPES = {
	string: 'string',
	text: 'text',
	select: 'select',
};

class CBQField {
	constructor(/** CBQField */ source) {
		/**
		 * One of CBQ_FIELD_TYPES-s
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
		const asserters = makeObjectAsserters(this, 'Field key "');

		asserters.member('type', CBQ_FIELD_TYPES);

		asserters.provided('name');
		asserters.type('name', 'string');

		asserters.provided('label');
		asserters.type('label', 'string');

		asserters.type('helpText', 'string');
	}
}

class CBQOptions {
	constructor(/** CBQOptions */ source) {
		/**
		 * Resource name. For example "user", "pay slip". This will be used to generate names all over the interface.
		 * @type {string}
		 */
		this.name = undefined;

		/**
		 * List of fields that will constitute data. Each member must duck-type to CBQField interface.
		 * @type {CBQField[]}
		 */
		this.fields = undefined;

		/**
		 * Functions which will be used to render HTML of various pages in the user interface.
		 * They will call into each other, and also call into "texts". You can override any or none of them.
		 * @type {CBQViews}
		 */
		this.views = undefined;

		/**
		 * Texts or functions to produce texts which will be rendered on screen or in messages.
		 * @type {CBQTexts}
		 */
		this.texts = undefined;

		/**
		 * Function to produce the list of items for the list view.
		 * Optionally, you can return CBQListData object, where besides the items,
		 * you can specufy some additional overrides.
		 * @type {function():Array|Promise}
		 */
		this.list = undefined;

		Object.assign(this, source);
	}

	validateAndCoerce() {
		const asserters = makeObjectAsserters(this, 'Option "');

		asserters.provided('name');
		asserters.type('name', 'string');

		asserters.provided('fields');
		asserters.type('fields', 'array');

		if (this.fields.length < 1) {
			throw new TypeError(`"fields" must have at least one field supplied`);
		}

		this.fields = this.fields.map((field, index) => {
			assertType(field, 'Field #' + index, 'object');

			field = new CBQField(field);
			try {
				field.validateAndCoerce();
			} catch (err) {
				throw new TypeError(`Invalid field #${index}: ${err.message}`);
			}
			return field;
		});

		this.views = new CBQViews(this.views);
		this.texts = new CBQTexts(this.texts);

		asserters.provided('list');
		asserters.type('list', 'function');
	}
}

class CBQContext {
	constructor(options) {
		/**
		 * @type {CBQOptions}
		 */
		this.options = options;
	}
}

module.exports = {
	CBQ_FIELD_TYPES,
	CBQField,
	CBQOptions,
	CBQContext,
};
