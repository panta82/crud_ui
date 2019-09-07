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
		 * Full express request object
		 * @type {e.Request}
		 */
		this.req = req;
	}

	/**
	 * Make a URL relative to the path where CBQ router is mounted, using given path and (optional) query object or string.
	 * @param {string} path
	 * @param {string|Object} query
	 */
	url(path, query = undefined) {
		let result = this.req.baseUrl + ensureLeadingChar('/', path);
		if (query) {
			if (typeof query === 'string') {
				result += ensureLeadingChar('?', query);
			} else {
				result += '?' + qs.encode(query);
			}
		}
		return result;
	}
}

module.exports = {
	CBQContext,
};
