'use strict';

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
		 * If we are operating in single record mode, given id will be null.
		 * @type {function(CUIContext, id):Promise<Object>|Object}
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
		 * @type {function(CUIContext, id, Object)}
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

	_validateAndCoerce(mustSupportList) {
		const asserters = makeObjectAsserters(this, '"', '" action');

		if (mustSupportList) {
			asserters.provided('getList');
		}
		asserters.type('getList', 'function');

		asserters.type('getSingle', 'function');

		if (this.update) {
			// In order for update to work, we must be able to get single record
			asserters.provided('getSingle');
		}
	}
}

module.exports = {
	CUIActions,
};
