class CBQFlashManagerOptions {
	constructor(source) {
		/**
		 * How to name the cookie used to track flash
		 * @type {string}
		 */
		this.cookie_name = 'CBQ_flash';

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
 * @param {CBQFlashManagerOptions} options
 * @return {CBQFlashManager}
 */
function createFlashManager(options) {
	options = new CBQFlashManagerOptions(options);

	const _flashes = new Map();

	return /** @lends CBQFlashManager.prototype */ {
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
		const cookiesStr = req.headers.cookie;
		if (!cookiesStr) {
			return next();
		}

		let startIndex = cookiesStr.indexOf(options.cookie_name);
		if (startIndex < 0) {
			return next();
		}

		while (cookiesStr[startIndex] !== '=' && startIndex < cookiesStr.length) {
			startIndex++;
		}
		startIndex++;
		let endIndex = startIndex;
		while (endIndex !== ';' && endIndex < cookiesStr.length) {
			endIndex++;
		}
		const key = cookiesStr.slice(startIndex, endIndex);
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

		const flashKey =
			Math.random()
				.toString(32)
				.slice(2) +
			Math.random()
				.toString(32)
				.slice(2);
		_flashes.set(flashKey, { data, timestamp: new Date() });

		res.cookie(options.cookie_name, flashKey, {
			httpOnly: true,
			sameSite: true,
		});
	}
}

module.exports = {
	CBQFlashManagerOptions,
	createFlashManager,
};
