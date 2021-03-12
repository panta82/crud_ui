import { CUIContext } from './context';
import { CUIError } from './errors';
import { CUIOptions } from './options';
import { ICUIRequestHandler, PromiseOrNot } from './definitions';
import { IFlashManager } from '../web/flash_manager';
import { ICUIRouteName } from './routes';

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

export function createHandlerResponseWrapper<T>(
  options: CUIOptions<T>,
  flashManager: IFlashManager
) {
  return function handlerResponseWrapper(
    handler: (ctx: CUIContext) => PromiseOrNot<CUIResponse | string>,
    routeName: ICUIRouteName
  ): ICUIRequestHandler {
    return function expressHandler(req, res, next) {
      // Remember which route was triggered
      req.routeName = routeName;
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
