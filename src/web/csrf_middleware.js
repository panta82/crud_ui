const { extractCookie, randomToken } = require('../tools');
const { CUICSRFError } = require('../types/errors');

class CUICSRFMiddlewareOptions {
	constructor(/** CUICSRFMiddlewareOptions */ source) {
		/**
		 * Whether CSRF creation and checking is enabled. Set to false to live dangerously.
		 * @type {boolean}
		 */
		this.enabled = true;

		/**
		 * Name of the form field to store the token in
		 * @type {string}
		 */
		this.field_name = '__cui_csrf__';

		/**
		 * Name of the cookie to store the token
		 * @type {string}
		 */
		this.cookie_name = 'CUI_csrf';

		Object.assign(this, source);
	}
}

class CUICSRFInfo {
	constructor(field, value) {
		this.field = field;
		this.value = value;
	}
}

/**
 * Middleware that generates and checks CSRF tokens
 * @param {CUICSRFMiddlewareOptions} options
 * @param {function} debugLog
 * @return {function(req, res, next)}
 */
function createCSRFMiddleware(options, debugLog) {
	options = new CUICSRFMiddlewareOptions(options);

	return middleware;

	/**
	 * Extract CSRF token from request and store it in req. Check its validity if there is a form body.
	 * @param {e.Request} req
	 * @param {e.Response} res
	 * @param next
	 */
	function middleware(req, res, next) {
		if (!options.enabled) {
			return next();
		}

		// Extract CSRF session
		let csrf = extractCookie(req.headers.cookie, options.cookie_name);

		// Check that CSRF is present in case we have a body
		if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
			const submittedCSRF = req.body[options.field_name];
			if (!csrf || !submittedCSRF || csrf !== submittedCSRF) {
				// Invalid CSRF
				return next(new CUICSRFError());
			}
		}

		// If csrf is not present, set it now
		if (!csrf) {
			csrf = randomToken();
			res.cookie(options.cookie_name, csrf, {
				httpOnly: true,
				sameSite: true,
				path: req.baseUrl,
			});
			debugLog(`CSRF set to "${csrf}" for ${req.baseUrl}`);
		}

		// Tell services downstream what csrf to use
		req.csrf = new CUICSRFInfo(options.field_name, csrf);

		return next();
	}
}

module.exports = {
	CUICSRFInfo,

	createCSRFMiddleware,
};
