import { Request } from 'express';
import { CUIIcons } from './icons';
import { ICUIExtendedRequest, ICUIFlash } from './definitions';
import { CUIActions } from './actions';
import { CUIOptions } from './options';
import { CUIField } from './fields';
import { CUITweaks } from './tweaks';
import { CUITexts } from './texts';
import { CUIRoutes, ICUIRouteName } from './routes';
import { CUIViews } from './views';

const qs = require('querystring');

const { ensureLeadingChar } = require('../tools');

// TODO: Try to remove automatic any
export class CUIContext<T = any> {
  /**
   * Coerced and validated options passed to the router
   */
  public options: CUIOptions<T> = undefined;

  /**
   * Id param extracted from req. Populated in edit and delete requests.
   */
  public idParam: string = undefined;

  /**
   * Request body
   */
  public body: Request['body'] = undefined;

  /**
   * Full URL of the request, from the root. So it includes both the part where CUI is hosted and CUI-specific path
   */
  public originalUrl: string = undefined;

  /**
   * URL where CUI handler is hosted. Eg. "/my/path" or "/"
   */
  public baseUrl: string = undefined;

  /**
   * Name of the route that was triggered for this request
   */
  public routeName: ICUIRouteName = undefined;

  /**
   * CSRF token for this request
   */
  public csrfToken: string = undefined;

  /**
   * Flash object extracted by FlashManager
   */
  public flash: ICUIFlash;

  constructor(options: CUIOptions<T>, req: ICUIExtendedRequest, routeName: ICUIRouteName) {
    this.options = options;
    this.idParam = (req.params && req.params.id) || null;
    this.body = req.body || null;
    this.originalUrl = req.originalUrl;
    this.baseUrl = req.baseUrl;
    this.routeName = routeName;
    this.csrfToken = req.csrfToken;
    this.flash = req.flash || {};
  }

  /**
   * Make a URL relative to the path where CUI router is mounted, using given path and (optional) query object or string.
   */
  url(path: string, query?: string | Object) {
    let result = this.baseUrl + ensureLeadingChar('/', path);
    if (query) {
      if (typeof query === 'string') {
        result += ensureLeadingChar('?', query);
      } else {
        result += '?' + qs.encode(query);
      }
    }
    return encodeURI(result);
  }

  /**
   * Convenience shortcut to actions
   */
  get actions(): CUIActions<T> {
    return this.options.actions;
  }

  /**
   * Convenience shortcut to fields
   */
  get fields(): CUIField[] {
    return this.options.fields;
  }

  /**
   * Convenience shortcut to tweaks
   */
  get tweaks(): CUITweaks {
    return this.options.tweaks;
  }

  /**
   * Convenience shortcut to views
   */
  get views(): CUIViews {
    return this.options.views;
  }

  /**
   * Convenience shortcut to texts
   */
  get texts(): CUITexts {
    return this.options.texts;
  }

  /**
   * Convenience shortcut to icons
   */
  get icons(): CUIIcons {
    return this.options.icons;
  }

  /**
   * Convenience shortcut to urls
   */
  get routes(): CUIRoutes {
    return this.options.routes;
  }
}
