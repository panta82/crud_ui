'use strict';

const { extractCookie, randomToken } = require('../tools');

const CLEAN_EXPIRED_SESSIONS_INTERVAL = 1000 * 60 * 5; // 5 minutes

class CUISession {
	constructor(/** CUISession */ source) {
		/**
		 * Session key, for the cookie
		 * @type {string}
		 */
		this.key = undefined;

		/**
		 * When was the session created
		 * @type {Date}
		 */
		this.createdAt = undefined;

		/**
		 * When was this session's cookie last seen
		 * @type {Date}
		 */
		this.lastSeenAt = undefined;

		/**
		 *
		 * @type {undefined}
		 */
		this.flash = undefined;

		/**
		 * CSRF token for this session
		 * @type {string}
		 */
		this.csrfToken = undefined;

		/**
		 * URL where we go when user backs out of the Edit page. This can be either List or Detail page.
		 * @type {string}
		 */
		this.editBackUrl = undefined;

		Object.assign(this, source);
	}
}

/**
 * Create and maintain sessions for active users. CUISession is attached to the req object.
 * @param cookieName
 * @param ttl
 * @param {function} debugLog
 */
function createSessionMiddleware(cookieName, ttl, debugLog) {
	/**
	 * @type {Map<string, CUISession>}
	 * @private
	 */
	const _sessions = new Map();

	let _lastSessionCleanupAt = new Date();

	middleware._sessions = _sessions;
	middleware._lastSessionCleanupAt = _lastSessionCleanupAt;

	return middleware;

	function cleanExpiredSessions() {
		const now = new Date();
		for (const session of _sessions.values()) {
			if (now - session.lastSeenAt > ttl) {
				debugLog(
					`Session ${session.key} has expired (last seen: ${session.lastSeenAt.toISOString()})`
				);
				_sessions.delete(session.key);
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
		const tabCookie = extractCookie(req.headers.cookie, 'CUI_tabsession');
		console.log('CUI_tabsession', tabCookie);

		const key = extractCookie(req.headers.cookie, cookieName);
		const now = new Date();

		let session;
		if (key) {
			session = _sessions.get(key);
		}
		if (!session) {
			// No session was found, or it has expired. Create a new one.
			session = new CUISession(
				{
					key: randomToken(),
					csrfToken: randomToken(),
					editBackUrl: null,
					createdAt: now,
				},
				this
			);

			_sessions.set(session.key, session);

			res.cookie(cookieName, session.key, {
				httpOnly: true,
				sameSite: true,
				// NOTE: We are not setting path here because we want all crudUI routers to share the same session
				//       (trying to reduce the number of cookies)
			});

			debugLog(
				`Session ${session.key} was created. IP: "${
					req.ip
				}" DATE: "${session.createdAt.toISOString()}"  CSRF: "${session.csrfToken}"`
			);
		}
		session.lastSeenAt = now;

		req.session = session;

		if (now - _lastSessionCleanupAt > CLEAN_EXPIRED_SESSIONS_INTERVAL) {
			cleanExpiredSessions();
			_lastSessionCleanupAt = now;
		}

		return next();
	}
}

module.exports = {
	createSessionMiddleware,
};
