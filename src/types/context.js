const qs = require('querystring');

const { ensureLeadingChar } = require('../tools');

class CBQContext {
	constructor(options, req) {
		/**
		 * Coerced and validated options passed to the router
		 * @type {CBQOptions}
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
		 * URL where CBQ handler is hosted. Eg. "/my/path" or "/"
		 * @type {string}
		 */
		this.baseUrl = req.baseUrl;

		/**
		 * Flash object extracted by FlashManager
		 * @type {{message: string, flavor: string}}
		 */
		this.flash = req.flash || {};
	}

	/**
	 * Make a URL relative to the path where CBQ router is mounted, using given path and (optional) query object or string.
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
}

module.exports = {
	CBQContext,
};
