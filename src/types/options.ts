import { assertType, cast, makeObjectAsserters, safeAssign } from '../tools';
import { ICUIMode, CUI_MODES } from './consts';
import { CUIField, ICUIFieldSource } from './fields';
import { CUIActions } from './actions';
import { CUINavigation } from './navigation';
import { CUITweaks, CUITweaksSource } from './tweaks';
import { CUITexts } from './texts';
import { CUIIcons } from './icons';
import { CUIViews } from './views';
import { CUIRoutes } from './routes';
import { CUIContext } from './context';
import { IDebugLogFunction, PartialExcept, Replace } from './definitions';

export type ICUIOptionsSource<T> = PartialExcept<
  Replace<
    CUIOptions<T>,
    {
      fields: ICUIFieldSource[];
      tweaks: CUITweaksSource;
      recordId: string | (<T>(record: T) => string);
      debugLog: boolean | IDebugLogFunction;
    }
  >,
  'name'
>;

export class CUIOptions<T> {
  /**
   * Resource name. For example "user", "pay slip". This will be used to generate names all over the interface.
   */
  public name: string = undefined;

  /**
   * Mode in which this router will operate. Significantly changes way in which different pages
   * and actions work. See ICUIMode docs for more details. Defaults to "detail_list".
   */
  public mode: ICUIMode = undefined;

  /**
   * A way to get ID or unique identifier out of a record. It can either be a string key (eg. "id"),
   * or a function that can take a record object and return a unique string representation of it.
   */
  public recordId: <T>(record: T) => string = undefined;

  /**
   * List of fields that will constitute data.
   */
  public fields: CUIField[] = undefined;

  /**
   * Functions to execute different supported CRUD operations.
   * User must supply these functions for the CMS to work.
   */
  public actions: CUIActions<T> = undefined;

  /**
   * Optional spec for the main navigation bar, at the top of page.
   */
  public navigation: CUINavigation = undefined;

  /**
   * Options which the default views will utilize to customize UI appearance.
   */
  public tweaks: CUITweaks = undefined;

  /**
   * Functions which will be used to render HTML of various pages in the user interface.
   * They will call into each other, and also call into "texts". You can override any or none of them.
   */
  public views: CUIViews = undefined;

  /**
   * Texts or functions to produce texts which will be rendered on screen or in messages.
   */
  public texts: CUITexts = undefined;

  /**
   * Icons to use for various elements of UI. Set any icon to null to hide the icon from UI element.
   */
  public icons: CUIIcons = undefined;

  /**
   * URLS to use for various pages of CMS. Rarely needed to be altered by user
   */
  public routes: CUIRoutes = undefined;

  /**
   * Function to be called in case of error. Defaults to console.error.
   */
  public onError: (ctx: CUIContext, err: Error) => void = undefined;

  /**
   * Set to true or provide your own logging function to get some logs from the CrudUI internals
   */
  public debugLog: IDebugLogFunction = undefined;

  /**
   * Trigger various minor tweaks depending whether we are running in production mode
   * (eg. load minimized assets). If not set, defaults to sniffing NODE_ENV.
   */
  public isProduction: boolean = undefined;

  constructor(source: ICUIOptionsSource<T>) {
    safeAssign(this, source);
  }

  _validateAndCoerce() {
    const asserters = makeObjectAsserters(this, 'Option "');

    asserters.provided('name');
    asserters.type('name', 'string');

    if (!this.mode) {
      this.mode = 'detail_list';
    }
    asserters.type('mode', 'string');
    asserters.member('mode', CUI_MODES);

    asserters.provided('fields');
    asserters.type('fields', 'array');

    if (this.recordId === undefined) {
      (this.recordId as any) = 'id';
    }
    asserters.type('recordId', 'string', 'function');
    // Turn record id into a getter
    if (typeof this.recordId === 'string') {
      const key = this.recordId;
      this.recordId = ob => (ob ? ob[key] : null);
    }

    if (this.fields.length < 1) {
      throw new TypeError(`"fields" must have at least one field supplied`);
    }

    this.fields = this.fields.map((field, index) => {
      assertType(field, 'Field #' + index, 'object');

      field = new CUIField(field);
      try {
        field._validateAndCoerce();
      } catch (err) {
        throw new TypeError(`Invalid field #${index}: ${err.message}`);
      }
      return field;
    });

    this.tweaks = cast(CUITweaks, this.tweaks);
    this.tweaks._validateAndCoerce();

    this.actions = cast(CUIActions, this.actions) as CUIActions<T>;
    this.actions._validateAndCoerce(this.mode);

    if (this.navigation) {
      asserters.type('navigation', 'object');
      this.navigation = new CUINavigation(this.navigation);
      this.navigation._validateAndCoerce();
    }

    this.views = cast(CUIViews, this.views);
    this.texts = cast(CUITexts, this.texts);
    this.icons = cast(CUIIcons, this.icons);
    this.routes = cast(CUIRoutes, this.routes);

    if (this.onError === undefined) {
      this.onError = (ctx, err) => {
        console.error(err);
      };
    }

    if ((this.debugLog as any) === true) {
      this.debugLog = msg => console.log(msg);
    } else if (!this.debugLog) {
      // Make it no-op
      this.debugLog = () => {};
    }

    if (this.isProduction === undefined) {
      this.isProduction = process.env.NODE_ENV === 'production';
    }
    asserters.type('isProduction', 'boolean');
  }

  get hasList() {
    return !!this.actions.getList;
  }

  get isSingleRecordMode() {
    return this.mode === CUI_MODES.single_record;
  }
}

module.exports = {
  CUIOptions,
};
