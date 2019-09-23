'use strict';

const { makeObjectAsserters, minInProd } = require('../tools');

/**
 * Options which the default views will utilize to customize UI appearance.
 * Allow user to modify aspects of UI without going "nuclear option" and rewriting views themselves.
 */
class CUITweaks {
	constructor(/** CUITweaks */ source) {
		/**
		 * If true, UI will show "Details" button in list view, which user will be able to click to see individual
		 * item details. On the detail view, there will be a way to go back to the list of all items.
		 * @type {boolean}
		 */
		this.allowBothListAndDetailViews = false;

		/**
		 * If enabled, renders a red box with validation error message and all the faults above the edit form.
		 * Otherwise, we will still show errors next to affected fields, but not above the form.
		 * This will have no influence on non-validation errors.
		 * @type {boolean}
		 */
		this.showValidationErrorSummary = true;

		/**
		 * List of global CSS files to load in every page and order in which to do it.
		 * Can take strings (paths) or functions which produce strings.
		 * @type {Array<string|function>}
		 */
		this.globalCSS = [
			minInProd('/css/bootstrap.css'),
			minInProd('/css/fontawesome.css'),
			'/css/styles.css',
		];

		/**
		 * List of global javascript files to load in every page and order in which to do it.
		 * Can take strings (paths) or functions which produce strings.
		 * @type {Array<string|function>}
		 */
		this.globalJS = [
			minInProd('/js/jquery-3.4.1.slim.js'),
			minInProd('/js/bootstrap.js'),
			'/js/scripts.js',
		];

		/**
		 * Name of the cookie to use for storing session id
		 * @type {string}
		 */
		this.sessionCookieName = 'CUI_session';

		/**
		 * How long to keep sessions in memory before we drop them (in ms).
		 * @type {number}
		 */
		this.sessionTTL = 1000 * 60 * 60 * 24; // 1 day;

		/**
		 * Enable CSRF protection in forms
		 * @type {boolean}
		 */
		this.csrfEnabled = true;

		/**
		 * Name of the form field to store the CSRF token in
		 * @type {string}
		 */
		this.csrfFieldName = '__cui_csrf__';

		/**
		 * Name of the cookie to use for storing flash messages.
		 * @type {string}
		 */
		this.flashCookieName = 'CUI_flash';

		/**
		 * How many milliseconds can a flash live before it is consumed
		 * @type {number}
		 */
		this.flashMaxAge = 1000 * 60;

		Object.assign(this, source);
	}

	_validateAndCoerce() {
		const asserters = makeObjectAsserters(this, 'tweak "', '"');

		asserters.type('showValidationErrorSummary', 'boolean');

		for (const key of ['globalCSS', 'globalJS']) {
			asserters.type(key, 'array');
			this[key] = this[key].map(item => {
				if (typeof item === 'function') {
					return item;
				}
				return () => item;
			});
		}

		asserters.provided('csrfEnabled');
		asserters.type('csrfEnabled', 'boolean');

		asserters.provided('csrfFieldName');
		asserters.type('csrfFieldName', 'string');

		asserters.provided('flashCookieName');
		asserters.type('flashCookieName', 'string');

		asserters.provided('flashMaxAge');
		asserters.type('flashMaxAge', 'number');
	}
}

module.exports = {
	CUITweaks,
};
