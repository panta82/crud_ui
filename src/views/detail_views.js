'use strict';

const { CUI_FIELD_TYPES } = require('../types/consts');
const { assertEqual, getOrCall, capitalize, escapeHTML } = require('../tools');

/**
 * Details page will show a single item with full details.
 * @param {CUIContext} ctx
 * @param {Object} record
 */
module.exports.detailPage = (ctx, record) => {
	return ctx.views.layout(
		ctx,
		ctx.texts.safe.detailPageTitle(ctx, record),
		`cui-page-detail`,
		`
		${ctx.views.detailHeader(ctx)}
		<main role="main" class="container mt-4 mb-4">
			${ctx.views.detailAbove(ctx, record)}
			${ctx.views.detailContent(ctx, record)}
			${ctx.views.detailBelow(ctx, record)}
		</main>
		${ctx.views.detailFooter(ctx, record)}
	`,
		`<link rel="stylesheet" href="${ctx.url('css/detail.css')}" />`
	);
};

/**
 * Header for the edit page
 * @param {CUIContext} ctx
 * @param {Object} record
 */
module.exports.detailHeader = (ctx, record) => {
	return ctx.views.header(ctx);
};

/**
 * Content to be rendered above the edit form. Should probably include the title.
 * @param {CUIContext} ctx
 * @param {Object} record
 */
module.exports.detailAbove = (ctx, record) => {
	return `
		<h2 class="mb-4 cui-page-title">
			${ctx.texts.safe.detailTitle(ctx, record)}
		</h2>`;
};

/**
 * Content to be rendered below the main form
 * @param {CUIContext} ctx
 * @param {Object} record
 */
module.exports.detailBelow = (ctx, record) => {
	return '';
};

/**
 * Footer for the edit page
 * @param {CUIContext} ctx
 * @param {Object} record
 */
module.exports.detailFooter = (ctx, record) => {
	return ctx.views.footer(ctx);
};

/**
 * Render a form to edit data
 * @param {CUIContext} ctx
 * @param {Object} record
 */
module.exports.detailContent = (ctx, record) => {
	return `
		<div class="cui-detail-content row justify-content-md-between">
		<div class="col-md-auto order-md-2 cui-detail-controls mb-4">
				${ctx.views.detailControls(ctx, record)}
			</div>
			<div class="col-md-auto order-md-1 cui-detail-fields">
				${ctx.fields
					.map((field, index) => {
						return ctx.views.detailField(ctx, record, field, index);
					})
					.filter(Boolean)
					.join('\n')}
			</div>
		</div>
	`;
};

/**
 * Render control buttons to the side
 * @param {CUIContext} ctx
 * @param {Object} record
 */
module.exports.detailControls = (ctx, record) => {
	const editBtn = ctx.actions.update ? this.detailEditButton(ctx, record) : '';
	const deleteBtn = ctx.actions.delete ? this.detailDeleteButton(ctx, record) : '';
	if (!editBtn && !deleteBtn) {
		// Don't show anything at all
		return '';
	}

	return `
		<div class="cui-detail-controls-content ${editBtn ? 'cui-detail-controls-has-edit' : ''} ${
		deleteBtn ? 'cui-detail-controls-has-delete' : ''
	}">
			${editBtn}
			${deleteBtn}
		</div>
	`;
};

/**
 * Button which leads to the edit page for current record
 * @param {CUIContext} ctx
 * @param {*} record
 * @return {string}
 */
module.exports.detailEditButton = (ctx, record) => {
	const label = ctx.texts.safe.detailEditButton(ctx, record);
	return `
		<a href="${ctx.url(ctx.urls.editPage(ctx.options.recordId(record)))}"
			class="btn btn-primary cui-edit-button" title="${ctx.texts.safe.detailEditButtonTitle(
				ctx,
				record
			)}">
			${ctx.views.icon(ctx, ctx.icons.detailEditButton, label && 'mr-1')}
			${label}
		</a>
	`;
};

/**
 * Render the delete form and button for a single item in the list view
 * @param {CUIContext} ctx
 * @param {*} record
 * @return {string}
 */
module.exports.detailDeleteButton = (ctx, record) => {
	const label = ctx.texts.safe.detailDeleteButton(ctx, record);
	return `
		<button type="button" class="btn btn-danger cui-delete-button"
			title="${ctx.texts.safe.detailDeleteButtonTitle(ctx, record)}">
			${ctx.views.icon(ctx, ctx.icons.detailDeleteButton, label && 'mr-1')}
			${label}
		</button>
	`;
};

/**
 * Cancel button on the edit form
 * @param {CUIContext} ctx
 * @param {Object} record
 */
module.exports.detailCancelButton = (ctx, record) => {
	const label = record
		? ctx.texts.safe.editExistingCancelButton(ctx, record)
		: ctx.texts.safe.editNewCancelButton(ctx, record);
	const title = record
		? ctx.texts.safe.editExistingCancelButtonTitle(ctx, record)
		: ctx.texts.safe.editNewCancelButtonTitle(ctx, record);
	const icon = record
		? ctx.views.icon(ctx, ctx.icons.editExistingCancelButton, label && 'mr-1')
		: ctx.views.icon(ctx, ctx.icons.editNewCancelButton, label && 'mr-1');
	return `
		<a href="${ctx.url(
			ctx.urls.indexPage
		)}" class="btn btn-light ml-1 cui-cancel-button" title="${title}">
			${icon}
			${label}
		</a>
	`;
};

/**
 * Render an individual edit field
 * @param {CUIContext} ctx
 * @param {Object} record
 * @param {CUIField} field
 * @param {*} index
 */
module.exports.detailField = (ctx, record, field, index) => {
	if (!field.allowDetail) {
		// Skip this field
		return null;
	}

	if (field.detailView) {
		// Render custom view
		const customView = field.detailView(record[field.name], ctx, record, field, index);
		if (customView !== undefined) {
			return customView;
		}
	}

	switch (field.type) {
		case CUI_FIELD_TYPES.string:
			return module.exports.detailFieldString(ctx, record, field, index);
		case CUI_FIELD_TYPES.secret:
			return module.exports.detailFieldSecret(ctx, record, field, index);
		case CUI_FIELD_TYPES.text:
			return module.exports.detailFieldText(ctx, record, field, index);
		case CUI_FIELD_TYPES.select:
			return module.exports.detailFieldSelect(ctx, record, field, index);
		case CUI_FIELD_TYPES.boolean:
			return module.exports.detailFieldBoolean(ctx, record, field, index);
	}

	throw new TypeError(`Invalid field type: ${field.type}`);
};

/**
 * Utility function to prepare a value to be shown in detail view.
 * @param {CUIContext} ctx
 * @param {Object} record
 * @param {CUIField} field
 * @param {*} index
 * @return {*}
 */
module.exports.detailFieldPrepareValue = (ctx, record, field, index) => {
	let value = record[field.name];
	if (!value) {
		value = '&nbsp;';
	}
	return value;
};

/**
 * Render a string field's details.
 * @param {CUIContext} ctx
 * @param {Object} record
 * @param {CUIField} field
 * @param {*} index
 */
module.exports.detailFieldString = (ctx, record, field, index) => {
	assertEqual(field.type, CUI_FIELD_TYPES.string, 'field type');

	const value = ctx.views.detailFieldPrepareValue(ctx, record, field, index);

	return `
	  <div class="cui-field-detail cui-field-name-${field.name} cui-field-string" data-field-name="${field.name}">
			<label>${field.label}</label>
			<article>${value}</article>
		</div>
	`;
};

/**
 * Render a secret field's details.
 * @param {CUIContext} ctx
 * @param {Object} record
 * @param {CUIField} field
 * @param {*} index
 */
module.exports.detailFieldSecret = (ctx, record, field, index) => {
	assertEqual(field.type, CUI_FIELD_TYPES.secret, 'field type');

	const value = ctx.views.detailFieldPrepareValue(ctx, record, field, index);

	return `
	  <div class="cui-field-detail cui-field-name-${field.name} cui-field-secret" data-field-name="${
		field.name
	}">
			<label>${field.label}</label>
			<article data-field-value="${escapeHTML(value)}">
				<span class="text-muted">••••••••</span>
			</article>
		</div>
	`;
};

/**
 * Render a text field's details.
 * @param {CUIContext} ctx
 * @param {Object} record
 * @param {CUIField} field
 * @param {*} index
 */
module.exports.detailFieldText = (ctx, record, field, index) => {
	assertEqual(field.type, CUI_FIELD_TYPES.text, 'field type');

	const value = ctx.views.detailFieldPrepareValue(ctx, record, field, index);

	return `
	  <div class="cui-field-detail cui-field-name-${field.name} cui-field-text" data-field-name="${field.name}">
			<label>${field.label}</label>
			<article>${value}</article>
		</div>
	`;
};

/**
 * Render a select field's selected value details.
 * @param {CUIContext} ctx
 * @param {Object} record
 * @param {CUIField} field
 * @param {*} index
 */
module.exports.detailFieldSelect = (ctx, record, field, index) => {
	assertEqual(field.type, CUI_FIELD_TYPES.select, 'field type');

	const selectedValue = ctx.views.detailFieldPrepareValue(ctx, record, field, index);

	return `
	  <div class="cui-field-detail cui-field-name-${field.name} cui-field-select" data-field-name="${field.name}">
			<label>${field.label}</label>
			<article>${selectedValue}</article>
		</div>
	`;
};

/**
 * Render a boolean field's details.
 * @param {CUIContext} ctx
 * @param {Object} record
 * @param {CUIField} field
 * @param {*} index
 */
module.exports.detailFieldBoolean = (ctx, record, field, index) => {
	assertEqual(field.type, CUI_FIELD_TYPES.boolean, 'field type');

	const value = ctx.views.detailFieldPrepareValue(ctx, record, field, index);

	return `
	  <div class="cui-field-detail cui-field-name-${field.name} cui-field-boolean" data-field-name="${
		field.name
	}">
			<label>${field.label}</label>
			<article>${ctx.views.icon(ctx, value ? ctx.icons.booleanTrue : ctx.icons.booleanFalse)}</article>
		</div>
	`;
};
