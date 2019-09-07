const { CBQContext } = require('../types/context');
const { CBQError } = require('../types/errors');

class CBQResponse {
	constructor(flash) {
		this.flash = flash;
	}

	static cast(hr) {
		return typeof hr === 'string' ? new CBQHtmlResponse(hr) : hr || {};
	}
}

class CBQHtmlResponse extends CBQResponse {
	constructor(html, flash) {
		super(flash);
		this.html = html;
	}
}

class CBQRedirectResponse extends CBQResponse {
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
 * @param {CBQOptions} options
 * @param {CBQFlashManager} flashManager
 * @return {handlerResponseWrapper}
 */
function createHandlerResponseWrapper(options, flashManager) {
	return function handlerResponseWrapper(handler) {
		return function expressHandler(req, res, next) {
			Promise.resolve()
				.then(() => {
					const ctx = new CBQContext(options, req);
					return handler(ctx);
				})
				.then(CBQResponse.cast)
				.then(
					/** CBQResponse */ resp => {
						if (resp.flash) {
							flashManager.setFlash(res, resp.flash);
						}

						if (resp instanceof CBQRedirectResponse) {
							return res.redirect(resp.redirect);
						}

						if (resp instanceof CBQHtmlResponse) {
							return res.header('Content-Type', 'text/html').send(resp.html);
						}

						throw new CBQError(`Invalid handler response`);
					}
				)
				.catch(next);
		};
	};
}

module.exports = {
	CBQResponse,
	CBQHtmlResponse,
	CBQRedirectResponse,

	createHandlerResponseWrapper,
};
