import { CUI_FIELD_TYPES, ICUIFieldType } from './consts';
import { capitalize, deslugify, makeObjectAsserters, safeAssign } from '../tools';
import { CUIContext } from './context';
import { PartialExcept } from './definitions';

interface ISelectOptionObject {
  title: string;
  label: string;
  value: any;
}
type ISelectOption = ISelectOptionObject | string;

// TODO: Figure out something for typed validation support
type IValidationSchema = any;

export type ICUIFieldSource = PartialExcept<CUIField, 'name'>;

export class CUIField {
  /**
   * Type of the field. This will switch on or off various other properties of the field definition.
   */
  public type: ICUIFieldType = undefined;

  /**
   * Name of the field. We will use this to get values out of the record (record[field.name]), so this should
   * probably be a javascript-safe string ([a-zA-Z0-9_]+)
   */
  public name: string = undefined;

  /**
   * Human-readable string to use when referring to field. If not provided, it is derived from name.
   * If label is not provided, it is also used as label.
   */
  public title: string = undefined;

  /**
   * Label to use in edit form. If not provided, we will use the title.
   * It is recommended to provide separate label and title for boolean fields (if you want to ask a question, for example).
   */
  public label: string = undefined;

  /**
   * Help text to display beneath the form. Optional.
   */
  public helpText: string = undefined;

  /**
   * Customized render function to present the field value in the list view (table cell).
   * Return undefined to fall back to default render.
   */
  public listView: (
    value,
    ctx: CUIContext,
    data: any[],
    record: any,
    index: number,
    field: CUIField
  ) => string = undefined;

  /**
   * Customized render function for field editor. If called for a new record,
   * value will be defaultValue and record will be null.
   * Return undefined to fall back to default view.
   */
  public editView: (
    value: any,
    ctx: CUIContext,
    record: any,
    field: CUIField,
    index: number
  ) => string = undefined;

  /**
   * Customized render function for detail view.
   * Return undefined to fall back to default view.
   */
  public detailView: (
    value: any,
    ctx: CUIContext,
    record: any,
    field: CUIField,
    index: number
  ) => string = undefined;

  /**
   * Show field in list view
   */
  public allowList = true;

  /**
   * Show field in detail view
   */
  public allowDetail = true;

  /**
   * Show field when creating a new record or editing an existing record.
   * Works in conjunction with allowEditNew and allowEditExisting.
   */
  public allowEdit = true;

  /**
   * Show field when creating a new record
   */
  public allowEditNew = true;

  /**
   * Show field when editing an existing record
   */
  public allowEditExisting = true;

  /**
   * Function or literal default value to pre-fill when creating a new record
   * @type {function(CUIContext, CUIField, number)|*}
   */
  public defaultValue: (ctx: CUIContext, field: CUIField, index: number) => any = undefined;

  /**
   * If field is "select", this will determine the behavior with null values. If set to falsy,
   * null option will be disabled. If set to true or empty string, null option will appear as empty.
   * If set to string, null option will hold that as label.
   */
  public nullOption: string | boolean = undefined;

  /**
   * Function getter or literal list of values to offer for select fields. Values can be just strings, or objects
   * in format {title, label, value}. Ignored for other field types.
   */
  public values: ISelectOption[] | ((ctx: CUIContext) => ISelectOption[]) = undefined;

  /**
   * How this field should be validated either during creation or updates.
   * Can be a custom function which returns a list of validation errors or validate.js compatible object.
   */
  public validate:
    | IValidationSchema
    | ((ctx: CUIContext, record: any, requestBody: any) => string | string[]) = undefined;

  /**
   * Validations which will be performed only during create. Merged with general validate results.
   * Can be a custom function which returns a list of validation errors or validate.js compatible object.
   */
  public validateCreate:
    | IValidationSchema
    | ((ctx: CUIContext, record: any, requestBody: any) => string | string[]) = undefined;

  /**
   * Validations which will be performed only during edit. Merged with general validate results.
   * Can be a custom function which returns a list of validation errors or validate.js compatible object.
   */
  public validateEdit:
    | IValidationSchema
    | ((ctx: CUIContext, record: any, requestBody: any) => string | string[]) = undefined;

  constructor(source?: ICUIFieldSource) {
    safeAssign(this, source);
  }

  _validateAndCoerce() {
    const asserters = makeObjectAsserters(this, 'Field key "');

    if (!this.type) {
      // Default field to string fields
      this.type = 'string';
    }
    asserters.member('type', CUI_FIELD_TYPES);
    if (this.type === 'select') {
      asserters.type('values', 'array', 'function');
    }

    asserters.provided('name');
    asserters.type('name', 'string');

    if (this.title === undefined) {
      this.title = capitalize(deslugify(this.name));
    }
    asserters.type('title', 'string');

    if (this.label === undefined) {
      this.label = this.title;
    }
    asserters.type('label', 'string');

    asserters.type('helpText', 'string');

    asserters.type('listView', 'function');
    asserters.type('editView', 'function');

    asserters.type('allowList', 'boolean');
    asserters.type('allowDetail', 'boolean');
    asserters.type('allowEdit', 'boolean');
    asserters.type('allowEditNew', 'boolean');
    asserters.type('allowEditExisting', 'boolean');
  }
}
