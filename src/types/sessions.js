'use strict';

class CUITabSession {
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

module.exports = {
	CUISession,
};