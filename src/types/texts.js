'use strict';

const {
	assertType,
	capitalize,
	uncapitalize,
	pluralize,
	singularize,
	escapeHTML,
} = require('../tools');

class CUITexts {
	constructor(/** CUITexts */ source) {
		/**
		 * Text description of a particular record. Defaults to #id. So we would get text like "deleted user #13".
		 * @param {CUIContext} ctx
		 * @param record
		 * @return {string}
		 */
		this.recordDescriptor = (ctx, record) => `#${ctx.options.recordId(record)}`;

		/**
		 * Generate title of a particular record, used for messages about that record. For example, "User #13".
		 * @param {CUIContext} ctx
		 * @param record
		 * @return {string}
		 */
		this.recordTitle = (ctx, record) =>
			`${singularize(ctx.options.name)} ${ctx.texts.recordDescriptor(ctx, record)}`;

		this.flashMessageRecordCreated = (/** CUIContext */ ctx, record) =>
			`${capitalize(ctx.texts.recordTitle(ctx, record))} created`;
		this.flashMessageRecordUpdated = (/** CUIContext */ ctx, record) =>
			`${capitalize(ctx.texts.recordTitle(ctx, record))} updated`;
		this.flashMessageRecordDeleted = (/** CUIContext */ ctx, record) =>
			`${capitalize(ctx.texts.recordTitle(ctx, record))} deleted`;

		this.pageBaseTitle = (/** CUIContext */ ctx) => pluralize(capitalize(ctx.options.name));

		this.listTitle = (/** CUIContext */ ctx) => pluralize(capitalize(ctx.options.name));
		this.listPageTitle = (/** CUIContext */ ctx) => ctx.texts.pageBaseTitle(ctx);
		this.listNoData = 'No data is available';
		this.listCreateButton = (/** CUIContext */ ctx) =>
			'Create a new ' + uncapitalize(singularize(ctx.options.name));
		this.listCreateButtonTitle = (/** CUIContext */ ctx) =>
			'Create a new ' + uncapitalize(singularize(ctx.options.name));
		this.listEditButton = 'Edit';
		this.listEditButtonTitle = 'Edit this item';
		this.listDetailButton = 'Show';
		this.listDetailButtonTitle = 'Show details about this item on a separate page';
		this.listDeleteButton = 'Delete';
		this.listDeleteButtonTitle = 'Delete this item';

		this.footerBackToTop = 'Back to top';
		this.footerCopyright = (/** CUIContext */ ctx) => {
			return `Copyright ${new Date().getFullYear()}, All rights reserved.`;
		};

		this.editNewTitle = (/** CUIContext */ ctx) =>
			`Create a new ${uncapitalize(singularize(ctx.options.name))}`;
		this.editNewPageTitle = (/** CUIContext */ ctx) => `${ctx.texts.pageBaseTitle(ctx)} > New`;
		this.editNewSaveButton = 'Create';
		this.editNewSaveButtonTitle = 'Submit form and create a new record';
		this.editNewCancelButton = 'Cancel';
		this.editNewCancelButtonTitle = 'Cancel creation and go back to the list';

		this.editExistingTitle = (/** CUIContext */ ctx, record) =>
			`Edit ${uncapitalize(ctx.texts.recordTitle(ctx, record))}`;
		this.editExistingPageTitle = (/** CUIContext */ ctx) =>
			`${ctx.texts.pageBaseTitle(ctx)} > Edit`;
		this.editExistingSaveButton = 'Save changes';
		this.editExistingSaveButtonTitle = 'Submit form and save changes';
		this.editExistingCancelButton = 'Cancel';
		this.editExistingCancelButtonTitle = 'Cancel edit and go back to the list';

		this.detailTitle = (/** CUIContext */ ctx, record) =>
			`${capitalize(ctx.texts.recordTitle(ctx, record))} details`;
		this.detailPageTitle = (/** CUIContext */ ctx, record) =>
			`${ctx.texts.pageBaseTitle(ctx)} > Details`;
		this.detailEditButton = 'Edit';
		this.detailEditButtonTitle = 'Edit';
		this.detailDeleteButton = 'Delete';
		this.detailDeleteButtonTitle = 'Delete';

		this.modalConfirmDeleteTitle = 'Are you sure?';
		this.modalConfirmDeleteQuestion = (/** CUIContext */ ctx, data, record, index) =>
			`You are about to delete ${uncapitalize(ctx.texts.recordTitle(ctx, record))}. Proceed?`;
		this.modalConfirmDeleteYesButton = 'Delete';
		this.modalConfirmDeleteNoButton = 'Cancel';

		this.errorPageTitle = (/** CUIContext */ ctx, err) => `Error`;
		this.errorNotFound = (/** CUIContext */ ctx, id) =>
			`${capitalize(singularize(ctx.options.name))} with id "${id}" couldn't be found`;

		Object.assign(this, source);

		/**
		 * An object with safe versions of all the texts
		 * @type {CUITexts}
		 */
		this.safe = {};

		// Turn all properties into functions
		// Also, generate safe getters, for HTML escaping
		Object.keys(this).forEach(key => {
			if (key === 'safe') {
				return;
			}

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

module.exports = new CUITexts();
module.exports.CUITexts = CUITexts;
