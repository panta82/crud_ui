'use strict';

const { makeObjectAsserters, capitalize, deslugify } = require('../tools');
const { CUI_FIELD_TYPES } = require('./consts');

class CUIField {
	constructor(/** CUIField */ source) {
		/**
		 * One of CUI_FIELD_TYPES-s
		 * @type {string}
		 */
		this.type = undefined;

		/**
		 * Name of the field. We will use this to get values out of the record (record[field.name]), so this should
		 * probably be a javascript-safe string ([a-zA-Z0-9_]+)
		 * @type {string}
		 */
		this.name = undefined;

		/**
		 * Human-readable string to use when referring to field. If not provided, it is derived from name.
		 * If label is not provided, it is also used as label.
		 * @type {string}
		 */
		this.title = undefined;

		/**
		 * Label to use in edit form. If not provided, we will use the title.
		 * It is recommended to provide separate label and title for boolean fields (if you want to ask a question, for example).
		 * @type {string}
		 */
		this.label = undefined;

		/**
		 * Help text to display beneath the form. Optional.
		 * @type {string}
		 */
		this.helpText = undefined;

		/**
		 * Customized render function to present the field value in the list view (table cell).
		 * Return undefined to fall back to default render.
		 * @type {function(value:*, ctx:CUIContext, data:array, record:*, index:number, field:CUIField)}
		 */
		this.listView = undefined;

		/**
		 * Customized render function for field editor. If called for a new record,
		 * value will be defaultValue and record will be null.
		 * Return undefined to fall back to default view.
		 * @type {function(value:*, ctx:CUIContext, record:*, field:CUIField, index:number)}
		 */
		this.editView = undefined;

		/**
		 * Customized render function for detail view.
		 * Return undefined to fall back to default view.
		 * @type {function(value:*, ctx:CUIContext, record:*, field:CUIField, index:number)}
		 */
		this.detailView = undefined;

		/**
		 * Show field in list view
		 * @type {boolean}
		 */
		this.allowList = true;

		/**
		 * Show field in detail view
		 * @type {boolean}
		 */
		this.allowDetail = true;

		/**
		 * Show field when creating a new record or editing an existing record.
		 * Works in conjunction with allowEditNew and allowEditExisting.
		 * @type {boolean}
		 */
		this.allowEdit = true;

		/**
		 * Show field when creating a new record
		 * @type {boolean}
		 */
		this.allowEditNew = true;

		/**
		 * Show field when editing an existing record
		 * @type {boolean}
		 */
		this.allowEditExisting = true;

		/**
		 * Function or literal default value to pre-fill when creating a new record
		 * @type {function(CUIContext, CUIField, number)|*}
		 */
		this.defaultValue = undefined;

		/**
		 * If field is "select", this will determine the behavior with null values. If set to falsy,
		 * null option will be disabled. If set to true or empty string, null option will appear as empty.
		 * If set to string, null option will hold that as label.
		 * @type {string|boolean}
		 */
		this.nullOption = undefined;

		/**
		 * Function getter or literal list of values to offer for select fields. Values can be just strings, or objects
		 * in format {title, value}. Ignored for other field types.
		 * @type {function(CUIContext, *, CUIField, number):string[]|string[]}
		 */
		this.values = undefined;

		/**
		 * How this field should be validated either during creation or updates.
		 * Can be a custom function which returns a list of validation errors or validate.js compatible object.
		 * @type {object|function(CUIContext, *, object):string[]}
		 */
		this.validate = undefined;

		/**
		 * Validations which will be performed only during create. Merged with general validate results.
		 * Can be a custom function which returns a list of validation errors or validate.js compatible object.
		 * @type {object|function(CUIContext, *, object):string[]}
		 */
		this.validateCreate = undefined;

		/**
		 * Validations which will be performed only during edit. Merged with general validate results.
		 * Can be a custom function which returns a list of validation errors or validate.js compatible object.
		 * @type {object|function(CUIContext, *, object):string[]}
		 */
		this.validateEdit = undefined;

		Object.assign(this, source);
	}

	_validateAndCoerce() {
		const asserters = makeObjectAsserters(this, 'Field key "');

		if (!this.type) {
			// Default field to string fields
			this.type = CUI_FIELD_TYPES.string;
		}
		asserters.member('type', CUI_FIELD_TYPES);
		if (this.type === CUI_FIELD_TYPES.select) {
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

module.exports = {
	CUIField,
};
