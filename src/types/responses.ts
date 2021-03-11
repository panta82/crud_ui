import { CUIContext } from './context';
import { CUIError } from './errors';
import { NextFunction, Request, Response } from 'express';

// TODO
type IFlash = 'TODO MAKE SURE WE FIX THIS';

export class CUIResponse {
	public flash: IFlash;
	constructor(flash: IFlash) {
		this.flash = flash;
	}

	static cast(hr) {
		return typeof hr === 'string' ? new CUIHtmlResponse(hr) : hr || {};
	}
}

export class CUIHtmlResponse extends CUIResponse {
	public html: string;
	constructor(html, flash?) {
		super(flash);
		this.html = html;
	}
}

export class CUIRedirectResponse extends CUIResponse {
	public redirect: string;
	constructor(redirect, flash?) {
		super(flash);
		this.redirect = redirect;
	}
}

export function createHandlerResponseWrapper(options: CUIOptions, flashManager: FlashManager) {
	return function handlerResponseWrapper(handler: (ctx: CUIContext) => CUIResponse, routeName) {
		return function expressHandler(req: Request, res: Response, next: NextFunction) {
			Promise.resolve()
				.then(() => {
					const ctx = new CUIContext(options, req, routeName);
					return handler(ctx);
				})
				.then(CUIResponse.cast)
				.then((resp: CUIResponse) => {
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
				})
				.catch(next);
		};
	};
}
