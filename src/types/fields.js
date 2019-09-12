const { makeObjectAsserters } = require('../tools');
const { CUI_FIELD_TYPES } = require('./consts');

class CUIField {
	constructor(/** CUIField */ source) {
		/**
		 * One of CUI_FIELD_TYPES-s
		 * @type {string}
		 */
		this.type = undefined;

		/**
		 * Name of the field, this will be mapped to a record key
		 * @type {string}
		 */
		this.name = undefined;

		/**
		 * Label to use in the form
		 * @type {string}
		 */
		this.label = undefined;

		/**
		 * Help text to display beneath the form. Optional.
		 * @type {string}
		 */
		this.helpText = undefined;

		/**
		 * If true, field will not appear in the edit screen.
		 * @type {boolean}
		 */
		this.noEdit = undefined;

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
		 * @type {function(CUIContext, any, CUIField, number):string[]|string[]}
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

		asserters.member('type', CUI_FIELD_TYPES);

		asserters.provided('name');
		asserters.type('name', 'string');

		asserters.provided('label');
		asserters.type('label', 'string');

		asserters.type('helpText', 'string');

		if (this.type === CUI_FIELD_TYPES.select) {
			asserters.type('values', 'array', 'function');
		}
	}
}

module.exports = {
	CUIField,
};
