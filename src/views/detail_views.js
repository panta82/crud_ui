'use strict';

const { CUI_FIELD_TYPES } = require('../types/consts');
const { assertEqual, escapeHTML } = require('../tools');

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
		ctx.views.detailHead(ctx, record),
		ctx.views.detailScripts(ctx, record)
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
	return `
		${ctx.views.footer(ctx)};
		${ctx.views.detailDeleteConfirmationModal(ctx, record)}
	`;
};

/**
 * Stuff to add to head of the detail page (styles, meta-tags...)
 * @param {CUIContext} ctx
 * @param {Array} data
 */
module.exports.detailHead = (ctx, data) => {
	return `<link rel="stylesheet" href="${ctx.url('css/detail.css')}" />`;
};

/**
 * Stuff to add at the very bottom, in the scripts section.
 * @param {CUIContext} ctx
 * @param {Array} data
 */
module.exports.detailScripts = (ctx, data) => {
	return ``;
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
	const backBtn = this.detailBackButton(ctx, record);
	const editBtn = this.detailEditButton(ctx, record);
	const deleteBtn = this.detailDeleteButton(ctx, record);
	if (!backBtn && !editBtn && !deleteBtn) {
		// Don't show anything at all
		return '';
	}

	return `
		<div class="cui-detail-controls-content ${backBtn ? 'cui-detail-controls-has-back' : ''} ${
		editBtn ? 'cui-detail-controls-has-edit' : ''
	} ${deleteBtn ? 'cui-detail-controls-has-delete' : ''}">
			${backBtn}
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
	if (!ctx.actions.update) {
		// Don't show edit button becuse update is not supported
		return '';
	}

	const label = ctx.texts.safe.detailEditButton(ctx, record);
	const href = ctx.url(
		ctx.options.isSingleRecordMode
			? ctx.routes.singleRecordModeEditPage
			: ctx.routes.detailEditPage(ctx.options.recordId(record))
	);
	return `
		<a href="${href}"
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
	if (!ctx.actions.delete || ctx.options.isSingleRecordMode) {
		// Deletion is not supported
		return '';
	}

	const label = ctx.texts.safe.detailDeleteButton(ctx, record);
	return `
		<button type="button" class="btn btn-danger cui-delete-button"
			title="${ctx.texts.safe.detailDeleteButtonTitle(ctx, record)}"
			onclick="showModal('delete_modal')">
			${ctx.views.icon(ctx, ctx.icons.detailDeleteButton, label && 'mr-1')}
			${label}
		</button>
	`;
};

/**
 * Back button on the detail page. Returns back to the list view (if available)
 * @param {CUIContext} ctx
 * @param {Object} record
 */
module.exports.detailBackButton = (ctx, record) => {
	if (ctx.options.isSingleRecordMode) {
		// There is nothing to go back to
		return '';
	}

	const label = ctx.texts.detailBackButton(ctx, record);
	return `
		<a href="${ctx.url(
			ctx.routes.indexPage
		)}" class="btn btn-light cui-back-button" title="${ctx.texts.detailBackButtonTitle(
		ctx,
		record
	)}">
			${ctx.views.icon(ctx, ctx.icons.detailBackButton, label && 'mr-1')}
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
 * Render a string field's details.
 * @param {CUIContext} ctx
 * @param {Object} record
 * @param {CUIField} field
 * @param {*} index
 */
module.exports.detailFieldString = (ctx, record, field, index) => {
	assertEqual(field.type, CUI_FIELD_TYPES.string, 'field type');

	const value = record[field.name] || '&nbsp;';

	return `
	  <div class="cui-field-detail cui-field-name-${field.name} cui-field-string" data-field-name="${field.name}">
			<label>${field.title}</label>
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

	const value = record[field.name] || '&nbsp;';

	return `
	  <div class="cui-field-detail cui-field-name-${field.name} cui-field-secret" data-field-name="${
		field.name
	}">
			<label>${field.title}</label>
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

	const value = record[field.name] || '&nbsp;';

	return `
	  <div class="cui-field-detail cui-field-name-${field.name} cui-field-text" data-field-name="${field.name}">
			<label>${field.title}</label>
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

	let selectedValue = record[field.name];
	const valueObject = field.values.find(x => x.value === selectedValue);
	if (valueObject) {
		selectedValue = valueObject.label;
	}
	selectedValue = selectedValue || '&nbsp;';

	return `
	  <div class="cui-field-detail cui-field-name-${field.name} cui-field-select" data-field-name="${field.name}">
			<label>${field.title}</label>
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

	const value = !!record[field.name];

	return `
	  <div class="cui-field-detail cui-field-name-${field.name} cui-field-boolean" data-field-name="${
		field.name
	}">
			<label>${field.title}</label>
			<article>${ctx.views.icon(ctx, value ? ctx.icons.booleanTrue : ctx.icons.booleanFalse)}</article>
		</div>
	`;
};

/**
 * Render "are you sure?" modal for deleting the item.
 * @param {CUIContext} ctx
 * @param {Object} record
 * @return {string}
 */
module.exports.detailDeleteConfirmationModal = (ctx, record) => {
	const yesLabel = ctx.texts.detailConfirmDeleteYesButton(ctx, record);
	const noLabel = ctx.texts.detailConfirmDeleteNoButton(ctx, record);
	return `
		<div class="modal fade cui-delete-modal" tabindex="-1" role="dialog" id="delete_modal">
			<div class="modal-dialog" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">${ctx.texts.detailConfirmDeleteTitle(ctx, record)}</h5>
						<button type="button" class="close" data-dismiss="modal" aria-label="Close">
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div class="modal-body">
						<p class="delete-modal-question">
							${ctx.texts.detailConfirmDeleteQuestion(ctx, record)}
						</p>
					</div>
					<div class="modal-footer">
						<form method="post" action="${ctx.url(
							ctx.routes.deleteAction(ctx.options.recordId(record))
						)}" class="d-inline">
							${ctx.views.csrfField(ctx)}
							<button type="submit" class="btn btn-danger">
								${ctx.views.icon(ctx, ctx.icons.detailConfirmDeleteYesButton, yesLabel ? 'mr-1' : '')}
								<span class="delete-modal-yes">${yesLabel}</span>
							</button>
						</form>
						<button type="button" class="btn btn-secondary" data-dismiss="modal">
							${ctx.views.icon(ctx, ctx.icons.detailConfirmDeleteNoButton, noLabel ? 'mr-1' : '')}
							<span class="delete-modal-no">${noLabel}</span>
						</button>
					</div>
				</div>
			</div>
		</div>
		`;
};
