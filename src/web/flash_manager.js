'use strict';

const { extractCookie, randomToken } = require('../tools');

/**
 * Use cookies to provide "flash message" functionality
 * @param cookieName
 * @param maxAge
 * @param {function} debugLog
 * @return {CUIFlashManager}
 */
function createFlashManager(cookieName, maxAge, debugLog) {
	const _flashes = new Map();

	return /** @lends CUIFlashManager.prototype */ {
		_flashes,

		middleware,
		setFlash,
	};

	function cleanOldFlashes() {
		const now = new Date();
		for (const [key, { timestamp }] in _flashes.entries()) {
			if (now - timestamp - timestamp > maxAge) {
				// Delete outdated flash
				_flashes.delete(key);
				debugLog(`Cleaned outdated flash "${key}"`);
			}
		}
	}

	/**
	 * Extract flash object from request and set it to req.flash
	 * @param {e.Request} req
	 * @param {e.Response} res
	 * @param next
	 */
	function middleware(req, res, next) {
		const key = extractCookie(req.headers.cookie, cookieName);
		if (!key) {
			// No flash message
			return next();
		}

		const entry = _flashes.get(key);

		_flashes.delete(key);
		res.clearCookie(cookieName);

		if (entry) {
			req.flash = entry.data;
			debugLog(`Consumed flash "${key}"`);
		}

		return next();
	}

	/**
	 * Set given object as a one-time flash, which will appear next time the same client calls back.
	 * Useful for redirects.
	 * @param {e.Response} res
	 * @param data
	 */
	function setFlash(res, data) {
		cleanOldFlashes();

		const flashKey = randomToken();
		_flashes.set(flashKey, { data, timestamp: new Date() });
		debugLog(`Set flash "${flashKey}": ${JSON.stringify(data)}`);

		res.cookie(cookieName, flashKey, {
			httpOnly: true,
			sameSite: true,
			// NOTE: We are not setting path here because we want all crudUI routers to share flashes
		});
	}
}

module.exports = {
	createFlashManager,
};
