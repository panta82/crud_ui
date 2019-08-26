'use strict';

const { assertType, makeObjectAsserters, capitalize, pluralize } = require('./tools');
const { CBQViews } = require('./views/views');
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

class CBQHandlers {
	constructor(/** CBQHandlers */ source) {
		/**
		 * Produce the list of items for the main table view. It should return either array of objects or TODO
		 * @type {function():Promise<Array>|Array}
		 */
		this.list = undefined;

		/**
		 * Update the record with given id. It will be called with a record id and update payload. If not provided, editing will be disabled.
		 * @type {function(*, Object)}
		 */
		this.update = undefined;

		/**
		 * Delete a record. It will be called with a record id. If not provided, deletion will be disabled.
		 * @type {function(*)}
		 */
		this.delete = undefined;

		Object.assign(this, source);
	}

	validateAndCoerce() {
		const asserters = makeObjectAsserters(this, '"', '" handler');

		asserters.provided('list');
		asserters.type('list', 'function');
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
		 * A way to get ID or unique identifier out of a record. It can either be a string key (eg. "id"),
		 * or a function that can take a record object and return a unique string representation of it.
		 * @type {string|function(*):string}
		 */
		this.recordId = undefined;

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
		 * Handlers for different CRUD operations to be operated against records.
		 * User must supply these functions for the CMS to work.
		 * @type {CBQHandlers}
		 */
		this.handlers = undefined;

		/**
		 * Function to be called in case of error. Defaults to console.error.
		 * @type {function(CBQContext, Error)}
		 */
		this.onError = undefined;

		Object.assign(this, source);
	}

	validateAndCoerce() {
		const asserters = makeObjectAsserters(this, 'Option "');

		asserters.provided('name');
		asserters.type('name', 'string');

		asserters.provided('fields');
		asserters.type('fields', 'array');

		asserters.provided('recordId');
		asserters.type('recordId', 'string', 'function');
		// Turn record id into a getter
		if (typeof this.recordId === 'string') {
			const key = this.recordId;
			this.recordId = ob => (ob ? ob[key] : '');
		}

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

		this.handlers = new CBQHandlers(this.handlers);
		this.handlers.validateAndCoerce();

		this.views = new CBQViews(this.views);
		this.texts = new CBQTexts(this.texts);

		if (this.onError === undefined) {
			this.onError = (ctx, err) => {
				console.error(err);
			};
		}
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
	CBQHandlers,
	CBQOptions,
	CBQContext,
};
