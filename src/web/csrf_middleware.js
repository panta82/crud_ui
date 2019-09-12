const { extractCookie, randomToken } = require('../tools');
const { CUICSRFError } = require('../types/errors');

class CUICSRFMiddlewareOptions {
	constructor(/** CUICSRFMiddlewareOptions */ source) {
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
 * @return {function(req, res, next)}
 */
function createCSRFMiddleware(options) {
	options = new CUICSRFMiddlewareOptions(options);

	return middleware;

	/**
	 * Extract CSRF token from request and store it in req. Check its validity if there is a form body.
	 * @param {e.Request} req
	 * @param {e.Response} res
	 * @param next
	 */
	function middleware(req, res, next) {
		// Extract CSRF, if any
		const existingCSRF = extractCookie(req.headers.cookie, options.cookie_name);

		// Check that CSRF is present in case we have a body
		if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
			const submittedCSRF = req.body[options.field_name];
			if (!existingCSRF || !submittedCSRF || existingCSRF !== submittedCSRF) {
				// Invalid CSRF
				return next(new CUICSRFError());
			}
		}

		// Generate and attach next CSRF
		const newCSRF = randomToken();
		req.csrf = new CUICSRFInfo(options.field_name, newCSRF);
		res.cookie(options.cookie_name, newCSRF, {
			httpOnly: true,
			sameSite: true,
		});

		return next();
	}
}

module.exports = {
	CUICSRFInfo,

	createCSRFMiddleware,
};
