const { assertType, makeObjectAsserters, cast } = require('../tools');
const { CUIField } = require('./fields');
const { CUIActions } = require('./actions');
const { CUINavigation } = require('./navigation');
const { CUITweaks } = require('./tweaks');
const { CUITexts } = require('./texts');
const { CUIIcons } = require('./icons');
const { CUIViews } = require('./views');
const { CUIUrls } = require('./urls');

class CUIOptions {
	constructor(/** CUIOptions */ source) {
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
		 * List of fields that will constitute data. Each member must duck-type to CUIField interface.
		 * @type {CUIField[]}
		 */
		this.fields = undefined;

		/**
		 * Functions to execute different supported CRUD operations.
		 * User must supply these functions for the CMS to work.
		 * @type {CUIActions}
		 */
		this.actions = undefined;

		/**
		 * Optional spec for the main navigation bar, at the top of page.
		 * @type {CUINavigation}
		 */
		this.navigation = undefined;
		
		/**
		 * Options which the default views will utilize to customize UI appearance.
		 * @type {CUITweaks}
		 */
		this.tweaks = undefined;

		/**
		 * Functions which will be used to render HTML of various pages in the user interface.
		 * They will call into each other, and also call into "texts". You can override any or none of them.
		 * @type {CUIViews}
		 */
		this.views = undefined;

		/**
		 * Texts or functions to produce texts which will be rendered on screen or in messages.
		 * @type {CUITexts}
		 */
		this.texts = undefined;

		/**
		 * Icons to use for various elements of UI. Set any icon to null to hide the icon from UI element.
		 * @type {CUIIcons}
		 */
		this.icons = undefined;

		/**
		 * URLS to use for various pages of CMS. Rarely needed to be altered by user
		 * @type {CUIUrls}
		 */
		this.urls = undefined;

		/**
		 * Function to be called in case of error. Defaults to console.error.
		 * @type {function(CUIContext, Error)}
		 */
		this.onError = undefined;

		/**
		 * Options related to flash messages
		 * @type {CUIFlashManagerOptions}
		 */
		this.flashOptions = undefined;

		/**
		 * Options related to CSRF protection
		 * @type {CUICSRFMiddlewareOptions}
		 */
		this.csrfOptions = undefined;

		/**
		 * Set to true or provide your own logging function to get some logs from the CrudUI internals
		 * @type {boolean|function(string)}
		 */
		this.debugLog = undefined;

		Object.assign(this, source);
	}

	_validateAndCoerce() {
		const asserters = makeObjectAsserters(this, 'Option "');

		asserters.provided('name');
		asserters.type('name', 'string');

		asserters.provided('fields');
		asserters.type('fields', 'array');

		if (this.recordId === undefined) {
			this.recordId = 'id';
		}
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

			field = new CUIField(field);
			try {
				field._validateAndCoerce();
			} catch (err) {
				throw new TypeError(`Invalid field #${index}: ${err.message}`);
			}
			return field;
		});

		this.actions = cast(CUIActions, this.actions);
		this.actions._validateAndCoerce();
		
		this.tweaks = cast(CUITweaks, this.tweaks);
		this.tweaks._validateAndCoerce();

		if (this.navigation) {
			asserters.type('navigation', 'object');
			this.navigation = new CUINavigation(this.navigation);
			this.navigation._validateAndCoerce();
		}

		this.views = cast(CUIViews, this.views);
		this.texts = cast(CUITexts, this.texts);
		this.icons = cast(CUIIcons, this.icons);
		this.urls = cast(CUIUrls, this.urls);

		if (this.onError === undefined) {
			this.onError = (ctx, err) => {
				console.error(err);
			};
		}

		this.flashOptions = asserters.type('debugLog', 'function', 'boolean');
		if (this.debugLog === true) {
			this.debugLog = msg => console.log(msg);
		} else if (!this.debugLog) {
			// Make it no-op
			this.debugLog = () => {};
		}
	}
}

module.exports = {
	CUIOptions,
};
