const { extractCookie, randomToken } = require('../tools');

class CUIFlashManagerOptions {
	constructor(source) {
		/**
		 * How to name the cookie used to track flash
		 * @type {string}
		 */
		this.cookie_name = 'CUI_flash';

		/**
		 * How many milliseconds can a flash live before it is consumed
		 * @type {number}
		 */
		this.max_age = 1000 * 60;

		Object.assign(this, source);
	}
}

/**
 * Use cookies to provide "flash message" functionality
 * @param {CUIFlashManagerOptions} options
 * @return {CUIFlashManager}
 */
function createFlashManager(options) {
	options = new CUIFlashManagerOptions(options);

	const _flashes = new Map();

	return /** @lends CUIFlashManager.prototype */ {
		_flashes,

		middleware,
		setFlash,
	};

	function cleanOldFlashes() {
		const now = new Date();
		for (const [key, { timestamp }] in _flashes.entries()) {
			if (now - timestamp - timestamp > options.max_age) {
				// Delete outdated flash
				_flashes.delete(key);
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
		const key = extractCookie(req.headers.cookie, options.cookie_name);
		if (!key) {
			// No flash message
			return next();
		}

		const entry = _flashes.get(key);

		_flashes.delete(key);
		res.clearCookie(options.cookie_name);

		if (entry) {
			req.flash = entry.data;
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

		res.cookie(options.cookie_name, flashKey, {
			httpOnly: true,
			sameSite: true,
		});
	}
}

module.exports = {
	CUIFlashManagerOptions,
	createFlashManager,
};
