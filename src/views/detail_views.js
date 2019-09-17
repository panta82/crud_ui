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
	`
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
		<h2 class="mb-5 cui-page-title">
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
		<div class="cui-detail-content row">
			<div class="col-md-9 cui-detail-fields">
				${ctx.fields
					.map((field, index) => {
						return ctx.views.detailField(ctx, record, field, index);
					})
					.filter(Boolean)
					.join('\n')}
			</div>
			<div class="col-md-3 cui-detail-controls">
				${ctx.views.detailControls(ctx, record)}
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
	let editBtn = ctx.actions.update ? this.detailEditButton(ctx, record) : '';
	let deleteBtn = ctx.actions.delete ? this.detailDeleteButton(ctx, record) : '';
	if (!editBtn && !deleteBtn) {
		// Don't show anything at all
		return '';
	}

	if (editBtn) {
		editBtn = `<div class="${deleteBtn ? 'mb-2' : ''}">${editBtn}</div>`;
	}
	if (deleteBtn) {
		deleteBtn = `<div>${deleteBtn}</div>`;
	}

	return `
		<div class="card">
			<div class="card-body">
				${editBtn}
				${deleteBtn}
			</div>
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
			class="btn btn-primary btn-block cui-edit-button" title="${ctx.texts.safe.detailEditButtonTitle(
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
		<button type="button" class="btn btn-danger btn-block cui-delete-button"
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
 * If error is present and error summary is enabled,
 * renders a red box with error message and all faults above the form.
 * @param {CUIContext} ctx
 * @param {Object} record
 */
module.exports.detailErrorSummary = (ctx, record) => {
	if (!ctx.flash.error) {
		return '';
	}

	if (!ctx.options.tweaks.showValidationErrorSummary) {
		return '';
	}

	let errorList = '';
	if (ctx.flash.error.faults && ctx.flash.error.faults.length >= 2) {
		errorList =
			'<ul class="mt-3 mb-0">' +
			ctx.flash.error.faults
				.map(fault => {
					return `<li>${fault.fullMessage}</li>`;
				})
				.join('\n') +
			'</ul>';
	}

	return `
		<div class="alert alert-danger mb-4 alert-dismissible fade show cui-error-summary" role="alert">
			<h5 class="my-0">${ctx.flash.error.message}</h5>
			${errorList}
			
			<button type="button" class="close" data-dismiss="alert" aria-label="Close">
				<span aria-hidden="true">&times;</span>
			</button>
		</div>
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
	return 'TODO';

	if (
		!field.allowEdit ||
		(!record && !field.allowEditNew) ||
		(record && !field.allowEditExisting)
	) {
		// Skip this field
		return null;
	}

	if (field.editView) {
		// Render custom editor
		const customView = field.editView(
			record ? record[field.name] : field.defaultValue,
			ctx,
			record,
			field,
			index
		);
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
 * Utility function to prepare help block. Must return an object.
 * @param {CUIContext} ctx
 * @param {Object} record
 * @param {CUIField} field
 * @param {*} index
 * @return {{dom, aria}}
 */
module.exports.detailFieldPrepareHelp = (ctx, record, field, index) => {
	if (!field.helpText) {
		// Do not render anything
		return { dom: '', aria: '' };
	}

	const id = `${field.name}_help_text`;
	return {
		dom: `<small id=${id} class="form-text text-muted">${getOrCall(
			field.helpText,
			ctx,
			record,
			field,
			index
		)}</small>`,
		aria: `aria-describedby="${id}"`,
	};
};

/**
 * Utility function to prepare an invalid field class and block. Must return an object.
 * @param {CUIContext} ctx
 * @param {Object} record
 * @param {CUIField} field
 * @param {*} index
 * @return {{dom, class}}
 */
module.exports.detailFieldPrepareError = (ctx, record, field, index) => {
	const faults =
		ctx.flash.error && ctx.flash.error.byFieldName && ctx.flash.error.byFieldName[field.name];
	if (!faults || !faults.length) {
		// Nothing to show
		return { dom: '', class: '' };
	}

	const lines = faults.map(f => `<li>${capitalize(f.message)}</li>`).join('\n');

	return {
		dom: `<div class="invalid-feedback">${lines}</div>`,
		class: 'is-invalid',
	};
};

/**
 * Utility function to prepare a value to be filled in edit field. Can be default value,
 * existing value to edit or the restored value after validation error.
 * @param {CUIContext} ctx
 * @param {Object} record
 * @param {CUIField} field
 * @param {*} index
 * @return {*}
 */
module.exports.detailFieldPrepareValue = (ctx, record, field, index) => {
	let value;
	if (ctx.flash.error && ctx.flash.error.payload) {
		// Restore value after error
		value = ctx.flash.error.payload[field.name];
	} else if (record) {
		value = record[field.name];
	} else if (field.defaultValue) {
		value = getOrCall(field.defaultValue, ctx, field, index);
	}

	if (value === null || value === undefined) {
		value = '';
	}

	return value;
};

/**
 * Render a string field. This maps to an ordinary text box.
 * @param {CUIContext} ctx
 * @param {Object} record
 * @param {CUIField} field
 * @param {*} index
 */
module.exports.detailFieldString = (ctx, record, field, index) => {
	assertEqual(field.type, CUI_FIELD_TYPES.string, 'field type');

	const help = ctx.views.detailFieldPrepareHelp(ctx, record, field, index);
	const error = ctx.views.detailFieldPrepareError(ctx, record, field, index);
	const value = ctx.views.detailFieldPrepareValue(ctx, record, field, index);

	return `
	  <div class="form-group cui-field cui-field-name-${field.name} cui-field-string" data-field-name="${field.name}">
			<label for="${field.name}">${field.label}</label>
			<input type="text" class="form-control ${error.class}" name="${field.name}" id="${field.name}" value="${value}" ${help.aria} />
			${error.dom}
			${help.dom}
		</div>
	`;
};

/**
 * Render a secret field. This maps to a password text box.
 * @param {CUIContext} ctx
 * @param {Object} record
 * @param {CUIField} field
 * @param {*} index
 */
module.exports.detailFieldSecret = (ctx, record, field, index) => {
	assertEqual(field.type, CUI_FIELD_TYPES.secret, 'field type');

	const help = ctx.views.detailFieldPrepareHelp(ctx, record, field, index);
	const error = ctx.views.detailFieldPrepareError(ctx, record, field, index);
	const value = ctx.views.detailFieldPrepareValue(ctx, record, field, index);

	return `
	  <div class="form-group cui-field cui-field-name-${field.name} cui-field-secret" data-field-name="${field.name}">
			<label for="${field.name}">${field.label}</label>
			<input type="password" class="form-control ${error.class}" name="${field.name}" id="${field.name}" value="${value}" ${help.aria} />
			${error.dom}
			${help.dom}
		</div>
	`;
};

/**
 * Render a text field. This maps to a text area.
 * @param {CUIContext} ctx
 * @param {Object} record
 * @param {CUIField} field
 * @param {*} index
 */
module.exports.detailFieldText = (ctx, record, field, index) => {
	assertEqual(field.type, CUI_FIELD_TYPES.text, 'field type');

	const help = ctx.views.detailFieldPrepareHelp(ctx, record, field, index);
	const error = ctx.views.detailFieldPrepareError(ctx, record, field, index);
	const value = ctx.views.detailFieldPrepareValue(ctx, record, field, index);

	return `
	  <div class="form-group cui-field cui-field-name-${field.name} cui-field-text" data-field-name="${field.name}">
			<label for="${field.name}">${field.label}</label>
			<textarea class="form-control ${error.class}" name="${field.name}" id="${field.name}" rows="3">${value}</textarea>
			${error.dom}
			${help.dom}
		</div>
	`;
};

/**
 * Render a select field. Uses DOM select element
 * @param {CUIContext} ctx
 * @param {Object} record
 * @param {CUIField} field
 * @param {*} index
 */
module.exports.detailFieldSelect = (ctx, record, field, index) => {
	assertEqual(field.type, CUI_FIELD_TYPES.select, 'field type');

	const help = ctx.views.detailFieldPrepareHelp(ctx, record, field, index);
	const error = ctx.views.detailFieldPrepareError(ctx, record, field, index);
	const selectedValue = ctx.views.detailFieldPrepareValue(ctx, record, field, index);

	const values = getOrCall(field.values, ctx, record, field, index);

	const options = values.map(v => {
		const value = v.value || v;
		const title = v.title || v;
		const selected = selectedValue === value ? 'selected="selected"' : '';
		return `<option value="${value}" ${selected}>${title}</option>`;
	});

	if (typeof field.nullOption === 'string' || field.nullOption === true) {
		// Add null option
		options.unshift(
			`<option value="" ${!selectedValue ? 'selected="selected"' : ''}>${
				field.nullOption.length ? field.nullOption : ''
			}</option>`
		);
	}

	return `
	  <div class="form-group cui-field cui-field-name-${field.name} cui-field-select" data-field-name="${field.name}">
			<label for="${field.name}">${field.label}</label>
			<select class="form-control ${error.class}" name="${field.name}" id="${field.name}">${options}</select>
			${error.dom}
			${help.dom}
		</div>
	`;
};

/**
 * Render a boolean field. This maps to a single checkbox.
 * @param {CUIContext} ctx
 * @param {Object} record
 * @param {CUIField} field
 * @param {*} index
 */
module.exports.detailFieldBoolean = (ctx, record, field, index) => {
	assertEqual(field.type, CUI_FIELD_TYPES.boolean, 'field type');

	const help = ctx.views.detailFieldPrepareHelp(ctx, record, field, index);
	const error = ctx.views.detailFieldPrepareError(ctx, record, field, index);
	const value = ctx.views.detailFieldPrepareValue(ctx, record, field, index);

	return `
	  <div class="form-group form-check cui-field cui-field-name-${
			field.name
		} cui-field-boolean" data-field-name="${field.name}">
			<input type="checkbox" class="form-check-input ${error.class}"
				name="${field.name}" id="${field.name}" ${value ? 'checked="checked"' : ''} value="true" ${
		help.aria
	} />
			<label class="form-check-label" for="${field.name}">${field.label}</label>
			${error.dom}
			${help.dom}
		</div>
	`;
};
