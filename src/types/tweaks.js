'use strict';

const { makeObjectAsserters } = require('../tools');

/**
 * Options which the default views will utilize to customize UI appearance.
 * Allow user to modify aspects of UI without going "nuclear option" and rewriting views themselves.
 */
class CUITweaks {
	constructor(/** CUITweaks */ source) {
		/**
		 * If enabled, renders a red box with validation error message and all the faults above the edit form.
		 * Otherwise, we will still show errors next to affected fields, but not above the form.
		 * This will have no influence on non-validation errors.
		 * @type {boolean}
		 */
		this.showValidationErrorSummary = true;

		Object.assign(this, source);
	}

	_validateAndCoerce() {
		const asserters = makeObjectAsserters(this, 'tweak "', '"');

		asserters.type('showValidationErrorSummary', 'boolean');
	}
}

module.exports = {
	CUITweaks,
};
