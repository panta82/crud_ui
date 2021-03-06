'use strict';

const qs = require('querystring');

const { ensureLeadingChar } = require('../tools');

class CUIContext {
	/**
	 * @param {CUIOptions} options
	 * @param {e.Request} req
	 * @param routeName
	 */
	constructor(options, req, routeName) {
		/**
		 * Coerced and validated options passed to the router
		 * @type {CUIOptions}
		 */
		this.options = options;

		/**
		 * Id param extracted from req. Populated in edit and delete requests.
		 * @type {*}
		 */
		this.idParam = (req.params && req.params.id) || null;

		/**
		 * Request body
		 * @type {Object}
		 */
		this.body = req.body || null;

		/**
		 * Full URL of the request, from the root. So it includes both the part where CUI is hosted and CUI-specific path
		 * @type {string}
		 */
		this.originalUrl = req.originalUrl;

		/**
		 * URL where CUI handler is hosted. Eg. "/my/path" or "/"
		 * @type {string}
		 */
		this.baseUrl = req.baseUrl;

		/**
		 * Name of the route that was triggered for this request
		 * @type {string}
		 */
		this.routeName = routeName;

		/**
		 * CSRF token for this request
		 * @type {string}
		 */
		this.csrfToken = req.csrfToken;

		/**
		 * Flash object extracted by FlashManager
		 * @type {{message: string, flavor: string}|{error: CUIValidationError}}
		 */
		this.flash = req.flash || {};
	}

	/**
	 * Make a URL relative to the path where CUI router is mounted, using given path and (optional) query object or string.
	 * @param {string} path
	 * @param {string|Object} query
	 */
	url(path, query = undefined) {
		let result = this.baseUrl + ensureLeadingChar('/', path);
		if (query) {
			if (typeof query === 'string') {
				result += ensureLeadingChar('?', query);
			} else {
				result += '?' + qs.encode(query);
			}
		}
		return encodeURI(result);
	}

	/**
	 * Convenience shortcut to actions
	 * @type {CUIActions}
	 */
	get actions() {
		return this.options.actions;
	}

	/**
	 * Convenience shortcut to fields
	 * @type {CUIField[]}
	 */
	get fields() {
		return this.options.fields;
	}

	/**
	 * Convenience shortcut to tweaks
	 * @type {CUITweaks}
	 */
	get tweaks() {
		return this.options.tweaks;
	}

	/**
	 * Convenience shortcut to views
	 * @type {CUIViews}
	 */
	get views() {
		return this.options.views;
	}

	/**
	 * Convenience shortcut to texts
	 * @type {CUITexts}
	 */
	get texts() {
		return this.options.texts;
	}

	/**
	 * Convenience shortcut to icons
	 * @type {CUIIcons}
	 */
	get icons() {
		return this.options.icons;
	}

	/**
	 * Convenience shortcut to urls
	 * @type {CUIRoutes}
	 */
	get routes() {
		return this.options.routes;
	}
}

module.exports = {
	CUIContext,
};
