'use strict';

const { CUI_MODES } = require('./consts');
const { makeObjectAsserters } = require('../tools');

/**
 * Functions to execute different supported CRUD operations.
 * User must supply these functions for the CMS to work.
 */
class CUIActions {
	constructor(/** CUIActions */ source) {
		/**
		 * Produce list of items to be edited. If this is provided, main view will be a table with these items.
		 * @type {function(CUIContext):Promise<Array>|Array}
		 */
		this.getList = undefined;

		/**
		 * Get single item for edit view. It will be called with record id,
		 * and should return either an object or null, if none is found.
		 * If operating in single record mode, id will be left out.
		 * @type {function(CUIContext, id?):Promise<Object>|Object}
		 */
		this.getSingle = undefined;

		/**
		 * Create a new record with given payload. If not provided, creation will be disabled.
		 * To display a flash message, return either a string or created record.
		 * If this is not provided, UI will not show Create button.
		 * @type {function(CUIContext, Object)}
		 */
		this.create = undefined;

		/**
		 * Update the record with given id. It will be called with a record id and update payload.
		 * If not provided, editing will be disabled.
		 * To display a flash message, return either a string or updated record.
		 * If this is not provided, UI will not show Edit button.
		 * If operating in single record mode, id will be left out
		 * @type {function(CUIContext, id?, Object)}
		 */
		this.update = undefined;

		/**
		 * Delete a record. It will be called with a record id.
		 * If this is not provided, UI will not show Delete button.
		 * @type {function(CUIContext, id)}
		 */
		this.delete = undefined;

		Object.assign(this, source);
	}

	_validateAndCoerce(mode) {
		const asserters = makeObjectAsserters(this, '"', '" action');

		if (mode === CUI_MODES.single_record) {
			// Single is required in single record mode
			asserters.provided('getSingle');
		} else {
			// List must be supported in normal mode
			asserters.provided('getList');

			if (this.update) {
				// Update requires getSingle
				asserters.provided('getSingle');
			}
		}

		asserters.type('getList', 'function');
		asserters.type('getSingle', 'function');
	}
}

module.exports = {
	CUIActions,
};
