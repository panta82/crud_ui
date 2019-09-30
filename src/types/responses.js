'use strict';

const { CUIContext } = require('../types/context');
const { CUIError } = require('../types/errors');

class CUIResponse {
	constructor(flash) {
		this.flash = flash;
	}

	static cast(hr) {
		return typeof hr === 'string' ? new CUIHtmlResponse(hr) : hr || {};
	}
}

class CUIHtmlResponse extends CUIResponse {
	constructor(html, flash) {
		super(flash);
		this.html = html;
	}
}

class CUIRedirectResponse extends CUIResponse {
	constructor(redirect, flash) {
		super(flash);
		this.redirect = redirect;
	}
}

/**
 * @callback expressHandler
 * @param {e.Request} req
 * @param {e.Response} res
 * @param next
 */
/**
 * @callback handlerResponseWrapper
 * @returns expressHandler
 */
/**
 * @param {CUIOptions} options
 * @param {CUIFlashManager} flashManager
 * @return {handlerResponseWrapper}
 */
function createHandlerResponseWrapper(options, flashManager) {
	return function handlerResponseWrapper(handler, routeName) {
		return function expressHandler(req, res, next) {
			Promise.resolve()
				.then(() => {
					const ctx = new CUIContext(options, req, routeName);
					return handler(ctx);
				})
				.then(CUIResponse.cast)
				.then(
					/** CUIResponse */ resp => {
						if (resp.flash) {
							flashManager.setFlash(res, resp.flash);
						}

						if (resp instanceof CUIRedirectResponse) {
							return res.redirect(resp.redirect);
						}

						if (resp instanceof CUIHtmlResponse) {
							return res.header('Content-Type', 'text/html').send(resp.html);
						}

						throw new CUIError(`Invalid handler response`);
					}
				)
				.catch(next);
		};
	};
}

module.exports = {
	CUIResponse,
	CUIHtmlResponse,
	CUIRedirectResponse,

	createHandlerResponseWrapper,
};
