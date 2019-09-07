const { makeObjectAsserters } = require('../tools');
const { CBQ_FIELD_TYPES } = require('./consts');

class CBQField {
	constructor(/** CBQField */ source) {
		/**
		 * One of CBQ_FIELD_TYPES-s
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
		 * @type {function(CBQContext, CBQField, number)|*}
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
		 * @type {function(CBQContext, any, CBQField, number):string[]|string[]}
		 */
		this.values = undefined;

		Object.assign(this, source);
	}

	validateAndCoerce() {
		const asserters = makeObjectAsserters(this, 'Field key "');

		asserters.member('type', CBQ_FIELD_TYPES);

		asserters.provided('name');
		asserters.type('name', 'string');

		asserters.provided('label');
		asserters.type('label', 'string');

		asserters.type('helpText', 'string');

		if (this.type === CBQ_FIELD_TYPES.select) {
			asserters.type('values', 'array', 'function');
		}
	}
}

module.exports = {
	CBQField,
};
