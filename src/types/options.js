const { assertType, makeObjectAsserters, escapeHTML } = require('../tools');
const { CBQTexts } = require('./texts');
const { CBQField } = require('./fields');
const { CBQViews } = require('./views');
const { CBQNavigation } = require('./navigation');

/**
 * Functions to execute different supported CRUD operations.
 * User must supply these functions for the CMS to work.
 */
class CBQActions {
	constructor(/** CBQActions */ source) {
		/**
		 * Produce list of items to be edited. If this is provided, main view will be a table with these items.
		 * @type {function(CBQContext):Promise<Array>|Array}
		 */
		this.getList = undefined;

		/**
		 * Get single item for edit view. It will be called with recird id, and should return either an object or null, if none is found.
		 * @type {function(CBQContext, id):Promise<Array>|Array}
		 */
		this.getSingle = undefined;

		/**
		 * Create a new record with given payload. If not provided, creation will be disabled.
		 * To display a flash message, return either a string or created record.
		 * @type {function(CBQContext, Object)}
		 */
		this.create = undefined;

		/**
		 * Update the record with given id. It will be called with a record id and update payload.
		 * If not provided, editing will be disabled.
		 * To display a flash message, return either a string or updated record.
		 * @type {function(CBQContext, id, Object)}
		 */
		this.update = undefined;

		/**
		 * Delete a record. It will be called with a record id. If not provided, deletion will be disabled.
		 * @type {function(CBQContext, id)}
		 */
		this.delete = undefined;

		Object.assign(this, source);
	}

	validateAndCoerce() {
		const asserters = makeObjectAsserters(this, '"', '" action');

		asserters.type('single', 'function');
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
		 * Functions to execute different supported CRUD operations.
		 * User must supply these functions for the CMS to work.
		 * @type {CBQActions}
		 */
		this.actions = undefined;

		/**
		 * Optional spec for the main navigation bar, at the top of page.
		 * @type {CBQNavigation}
		 */
		this.navigation = undefined;

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

		this.actions = new CBQActions(this.actions);
		this.actions.validateAndCoerce();

		this.views = new CBQViews(this.views);
		this.texts = new CBQTexts(this.texts);

		if (this.navigation) {
			asserters.type('navigation', 'object');
			this.navigation = new CBQNavigation(this.navigation);
			this.navigation.validateAndCoerce();
		}

		if (this.onError === undefined) {
			this.onError = (ctx, err) => {
				console.error(err);
			};
		}
	}
}

module.exports = {
	CBQActions,
	CBQOptions,
};