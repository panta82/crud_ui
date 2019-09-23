'use strict';

const { CUICSRFError } = require('../types/errors');

/**
 * Middleware that generates and checks CSRF tokens
 * @param {string} fieldName
 * @param {function} debugLog
 * @return {function(req, res, next)}
 */
function createCSRFMiddleware(fieldName, debugLog) {
	return middleware;

	/**
	 * Extract CSRF token from request and store it in req. Check its validity if there is a form body.
	 * @param {e.Request} req
	 * @param {e.Response} res
	 * @param next
	 */
	function middleware(req, res, next) {
		/** @type {CUISession} */
		const session = req.session;
		if (!session) {
			throw new Error(`Session not found in request. Is session middleware present?`);
		}

		// Check that CSRF is present in case we have a body
		if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
			const submittedCSRF = req.body[fieldName];
			if (!submittedCSRF || session.csrfToken !== submittedCSRF) {
				// Invalid CSRF
				return next(new CUICSRFError());
			}
		}

		return next();
	}
}

module.exports = {
	createCSRFMiddleware,
};
