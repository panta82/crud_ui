import { CUIContext } from './context';
import { safeAssign } from '../tools';

const {
  assertType,
  capitalize,
  uncapitalize,
  pluralize,
  singularize,
  escapeHTML,
} = require('../tools');

type ICUITextKey = Exclude<keyof CUITexts, 'safe' | 'use'>;

/**
 * Object holding all texts used in a CRUD app. For each of these keys, you can replace your own function or literal string.
 */
export class CUITexts {
  /**
   * Text description of a particular record. Defaults to #id. So we would get text like "deleted user #13".
   */
  public recordDescriptor = <T>(ctx: CUIContext, record: T): string =>
    ctx.options.isSingleRecordMode ? '' : `#${ctx.options.recordId(record)}`;

  /**
   * Generate title of a particular record, used for messages about that record. For example, "User #13".
   */
  public recordTitle = <T>(ctx: CUIContext, record: T): string =>
    ctx.options.isSingleRecordMode
      ? ctx.options.name
      : `${singularize(ctx.options.name)} ${ctx.texts.recordDescriptor(ctx, record)}`;

  public flashMessageRecordCreated = <T>(ctx: CUIContext, record: T): string =>
    `${capitalize(ctx.texts.recordTitle(ctx, record))} created`;
  public flashMessageRecordUpdated = <T>(ctx: CUIContext, record: T): string =>
    `${capitalize(ctx.texts.recordTitle(ctx, record))} updated`;
  public flashMessageRecordDeleted = <T>(ctx: CUIContext, record: T): string =>
    `${capitalize(ctx.texts.recordTitle(ctx, record))} deleted`;

  public pageBaseTitle = (ctx: CUIContext) => pluralize(capitalize(ctx.options.name));

  public listTitle = (ctx: CUIContext) => pluralize(capitalize(ctx.options.name));
  public listPageTitle = (ctx: CUIContext) => ctx.texts.pageBaseTitle(ctx);
  public listNoData = (ctx: CUIContext) => 'No data is available';
  public listCreateButton = (ctx: CUIContext) =>
    'Create a new ' + uncapitalize(singularize(ctx.options.name));
  public listCreateButtonTitle = (ctx: CUIContext) =>
    'Create a new ' + uncapitalize(singularize(ctx.options.name));
  public listEditButton = (ctx: CUIContext) => 'Edit';
  public listEditButtonTitle = (ctx: CUIContext) => 'Edit this item';
  public listDetailButton = (ctx: CUIContext) => 'Show';
  public listDetailButtonTitle = (ctx: CUIContext) =>
    'Show details about this item on a separate page';
  public listDeleteButton = (ctx: CUIContext) => 'Delete';
  public listDeleteButtonTitle = (ctx: CUIContext) => 'Delete this item';

  public listConfirmDeleteTitle = <T>(ctx: CUIContext, data: T[], record: T, index: number) =>
    'Are you sure?';
  public listConfirmDeleteQuestion = <T>(ctx: CUIContext, data: T[], record: T, index: number) =>
    `You are about to delete ${uncapitalize(ctx.texts.recordTitle(ctx, record))}. Proceed?`;
  public listConfirmDeleteYesButton = <T>(ctx: CUIContext, data: T[], record: T, index: number) =>
    'Delete';
  public listConfirmDeleteNoButton = <T>(ctx: CUIContext, data: T[], record: T, index: number) =>
    'Cancel';

  public footerBackToTop = (ctx: CUIContext) => 'Back to top';
  public footerCopyright = (ctx: CUIContext) => {
    return `Copyright ${new Date().getFullYear()}, All rights reserved.`;
  };

  public editNewTitle = (ctx: CUIContext) =>
    `Create a new ${uncapitalize(singularize(ctx.options.name))}`;
  public editNewPageTitle = (ctx: CUIContext) => `${ctx.texts.pageBaseTitle(ctx)} > New`;
  public editNewSaveButton = (ctx: CUIContext) => 'Create';
  public editNewSaveButtonTitle = (ctx: CUIContext) => 'Submit form and create a new record';
  public editNewCancelButton = (ctx: CUIContext) => 'Cancel';
  public editNewCancelButtonTitle = (ctx: CUIContext) => 'Cancel creation and go back to the list';

  public editExistingTitle = <T>(ctx: CUIContext, record: T) =>
    `Edit ${uncapitalize(ctx.texts.recordTitle(ctx, record))}`;
  public editExistingPageTitle = <T>(ctx: CUIContext, record: T) =>
    `${ctx.texts.pageBaseTitle(ctx)} > Edit`;
  public editExistingSaveButton = <T>(ctx: CUIContext, record: T) => 'Save changes';
  public editExistingSaveButtonTitle = <T>(ctx: CUIContext, record: T) =>
    'Submit form and save changes';
  public editExistingCancelButton = <T>(ctx: CUIContext, record: T) => 'Cancel';
  public editExistingCancelButtonTitle = <T>(ctx: CUIContext, record: T) =>
    'Cancel edit and go back to the list';

  public detailTitle = <T>(ctx: CUIContext, record: T) =>
    ctx.options.isSingleRecordMode
      ? `${capitalize(ctx.texts.recordTitle(ctx, record))}`
      : `${capitalize(ctx.texts.recordTitle(ctx, record))} details`;
  public detailPageTitle = <T>(ctx: CUIContext, record: T) =>
    `${ctx.texts.pageBaseTitle(ctx)} > Details`;
  public detailEditButton = <T>(ctx: CUIContext, record: T) => 'Edit';
  public detailEditButtonTitle = <T>(ctx: CUIContext, record: T) => 'Edit';
  public detailDeleteButton = <T>(ctx: CUIContext, record: T) => 'Delete';
  public detailDeleteButtonTitle = <T>(ctx: CUIContext, record: T) => 'Delete';
  public detailBackButton = <T>(ctx: CUIContext, record: T) => 'Back';
  public detailBackButtonTitle = <T>(ctx: CUIContext, record: T) => 'Back to the list view';

  public detailConfirmDeleteTitle = <T>(ctx: CUIContext, record: T) => 'Are you sure?';
  public detailConfirmDeleteQuestion = <T>(ctx: CUIContext, record: T) =>
    `You are about to delete ${uncapitalize(ctx.texts.recordTitle(ctx, record))}. Proceed?`;
  public detailConfirmDeleteYesButton = <T>(ctx: CUIContext, record: T) => 'Delete';
  public detailConfirmDeleteNoButton = <T>(ctx: CUIContext, record: T) => 'Cancel';

  public errorPageTitle = (ctx: CUIContext, err) => `Error`;
  public errorNotFound = (ctx: CUIContext, id) =>
    `${capitalize(singularize(ctx.options.name))} with id "${id}" couldn't be found`;

  /**
   * An object with safe versions of all the texts
   */
  public safe: { [key in ICUITextKey]: CUITexts[key] };

  /**
   * Typescript-friendly way to replace string values.
   * @example
   *     texts.use('detailDeleteButtonTitle', 'Remove').use('detailConfirmDeleteNoButton', 'Abandon');
   */
  use<TKey extends ICUITextKey>(key: TKey, newValue: CUITexts[TKey] | string): CUITexts {
    (this[key] as any) = newValue; // Just use the setter
    return this;
  }

  /**
   * User can provide literal strings in place of functions. We will auto-convert
   */
  constructor(source?: Partial<CUITexts | { [key in ICUITextKey]: string }>) {
    safeAssign(this, source as any);

    // Turn all properties into functions
    // Also, generate safe getters, for HTML escaping
    Object.keys(this).forEach(key => {
      if (key === 'safe') {
        return;
      }

      this.safe = {} as any;

      let getter = makeGetter(this[key]);
      let safeGetter = makeSafeGetter(getter);
      Object.defineProperty(this, key, {
        get() {
          return getter;
        },
        set(newVal) {
          getter = makeGetter(newVal);
          safeGetter = makeSafeGetter(getter);
        },
      });
      Object.defineProperty(this.safe, key, {
        get() {
          return safeGetter;
        },
      });
    });
  }
}

function makeGetter(val) {
  assertType(val, 'Text value', 'string', 'function');

  if (typeof val === 'string') {
    // Simple string getter
    return () => val;
  } else if (typeof val === 'function') {
    // Function getter
    return val;
  }
  throw new Error(`Invalid text value: ${val}. It must be either string or function`);
}

function makeSafeGetter(getter) {
  return (...args) => escapeHTML(getter(...args));
}
