const { CBQ_FIELD_TYPES } = require('../types/consts');
const { assertEqual, getOrCall, capitalize } = require('../tools');

/**
 * Renders edit page. This covers both editing existing record and creating a new one
 * @param {CBQContext} ctx
 * @param {Object} record
 */
module.exports.editPage = (ctx, record) => {
	return ctx.options.views.layout(
		ctx,
		`
		${ctx.options.views.editHeader(ctx)}
		<main role="main" class="container mt-4 mb-4">
			${ctx.options.views.editAbove(ctx, record)}
			${ctx.options.views.editContent(ctx, record)}
			${ctx.options.views.editBelow(ctx, record)}
		</main>
		${ctx.options.views.editFooter(ctx, record)}
	`
	);
};

/**
 * Header for the edit page
 * @param {CBQContext} ctx
 * @param {Object} record
 */
module.exports.editHeader = (ctx, record) => {
	return ctx.options.views.header(ctx);
};

/**
 * Content to be rendered above the edit form. Should probably include the title.
 * @param {CBQContext} ctx
 * @param {Object} record
 */
module.exports.editAbove = (ctx, record) => {
	return `
		<h2 class="mb-5">${
			record
				? ctx.options.texts.safe.editExistingTitle(ctx, record)
				: ctx.options.texts.safe.editNewTitle(ctx)
		}</h2>
		${ctx.options.views.editError(ctx, record)}`;
};

/**
 * Content to be rendered below the main form
 * @param {CBQContext} ctx
 * @param {Object} record
 */
module.exports.editBelow = (ctx, record) => {
	return '';
};

/**
 * Footer for the edit page
 * @param {CBQContext} ctx
 * @param {Object} record
 */
module.exports.editFooter = (ctx, record) => {
	return ctx.options.views.footer(ctx);
};

/**
 * Render a form to edit data
 * @param {CBQContext} ctx
 * @param {Object} record
 */
module.exports.editContent = (ctx, record) => {
	return `
		<form method="post">
			${ctx.options.views.csrfField(ctx)}
			${ctx.options.fields
				.map((field, index) => {
					return ctx.options.views.editField(ctx, record, field, index);
				})
				.filter(Boolean)
				.join('\n')}
			<div>
				<button type="submit" class="btn btn-success">${
					record
						? ctx.options.texts.safe.editExistingSave(ctx, record)
						: ctx.options.texts.safe.editNewSave(ctx, record)
				}</button>
				<a href="${ctx.url(ctx.options.urls.indexPage)}" class="btn btn-light ml-1">${
		record
			? ctx.options.texts.safe.editExistingCancel(ctx, record)
			: ctx.options.texts.safe.editNewCancel(ctx, record)
	}</a>
			</div>
		</form>
	`;
};

/**
 * Render error in the form header, if one is present
 * @param {CBQContext} ctx
 * @param {Object} record
 */
module.exports.editError = (ctx, record) => {
	if (!ctx.flash.error) {
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
		<div class="alert alert-danger mb-4 alert-dismissible fade show" role="alert">
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
 * @param {CBQContext} ctx
 * @param {Object} record
 * @param {CBQField} field
 * @param {*} index
 */
module.exports.editField = (ctx, record, field, index) => {
	if (field.noEdit) {
		// Do not display field at all
		return null;
	}
	switch (field.type) {
		case CBQ_FIELD_TYPES.string:
			return module.exports.editFieldString(ctx, record, field, index);
		case CBQ_FIELD_TYPES.text:
			return module.exports.editFieldText(ctx, record, field, index);
		case CBQ_FIELD_TYPES.select:
			return module.exports.editFieldSelect(ctx, record, field, index);
	}
	throw new TypeError(`Invalid field type: ${field.type}`);
};

/**
 * Utility function to prepare help block. Must return an object.
 * @param {CBQContext} ctx
 * @param {Object} record
 * @param {CBQField} field
 * @param {*} index
 * @return {{dom, aria}}
 */
module.exports.editFieldPrepareHelp = (ctx, record, field, index) => {
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
 * @param {CBQContext} ctx
 * @param {Object} record
 * @param {CBQField} field
 * @param {*} index
 * @return {{dom, class}}
 */
module.exports.editFieldPrepareError = (ctx, record, field, index) => {
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
 * @param {CBQContext} ctx
 * @param {Object} record
 * @param {CBQField} field
 * @param {*} index
 * @return {*}
 */
module.exports.editFieldPrepareValue = (ctx, record, field, index) => {
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
 * @param {CBQContext} ctx
 * @param {Object} record
 * @param {CBQField} field
 * @param {*} index
 */
module.exports.editFieldString = (ctx, record, field, index) => {
	assertEqual(field.type, CBQ_FIELD_TYPES.string, 'field type');

	const help = ctx.options.views.editFieldPrepareHelp(ctx, record, field, index);
	const error = ctx.options.views.editFieldPrepareError(ctx, record, field, index);
	const value = ctx.options.views.editFieldPrepareValue(ctx, record, field, index);

	return `
	  <div class="form-group">
			<label for="${field.name}">${field.label}</label>
			<input type="text" class="form-control ${error.class}" name="${field.name}" id="${field.name}" value="${value}" ${help.aria} />
			${error.dom}
			${help.dom}
		</div>
	`;
};

/**
 * Render a text field. This maps to a text area.
 * @param {CBQContext} ctx
 * @param {Object} record
 * @param {CBQField} field
 * @param {*} index
 */
module.exports.editFieldText = (ctx, record, field, index) => {
	assertEqual(field.type, CBQ_FIELD_TYPES.text, 'field type');

	const help = ctx.options.views.editFieldPrepareHelp(ctx, record, field, index);
	const error = ctx.options.views.editFieldPrepareError(ctx, record, field, index);
	const value = ctx.options.views.editFieldPrepareValue(ctx, record, field, index);

	return `
	  <div class="form-group">
			<label for="${field.name}">${field.label}</label>
			<textarea class="form-control ${error.class}" name="${field.name}" id="${field.name}" rows="3">${value}</textarea>
			${error.dom}
			${help.dom}
		</div>
	`;
};

/**
 * Render a select field. Uses DOM select element
 * @param {CBQContext} ctx
 * @param {Object} record
 * @param {CBQField} field
 * @param {*} index
 */
module.exports.editFieldSelect = (ctx, record, field, index) => {
	assertEqual(field.type, CBQ_FIELD_TYPES.select, 'field type');

	const help = ctx.options.views.editFieldPrepareHelp(ctx, record, field, index);
	const error = ctx.options.views.editFieldPrepareError(ctx, record, field, index);
	const selectedValue = ctx.options.views.editFieldPrepareValue(ctx, record, field, index);

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
	  <div class="form-group">
			<label for="${field.name}">${field.label}</label>
			<select class="form-control ${error.class}" name="${field.name}" id="${field.name}">${options}</select>
			${error.dom}
			${help.dom}
		</div>
	`;
};
