const { CBQ_FIELD_TYPES } = require('../consts');
const { assertEqual, getOrCall } = require('../tools');

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
	return `<h2>${
		record ? ctx.options.texts.editExistingTitle(ctx, record) : ctx.options.texts.editNewTitle(ctx)
	}</h2>`;
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
			${ctx.options.fields
				.map((field, index) => {
					return ctx.options.views.editField(ctx, record, field, index);
				})
				.filter(Boolean)
				.join('\n')}
			<div>
				<button type="submit" class="btn btn-success">${
					record
						? ctx.options.texts.editExistingSave(ctx, record)
						: ctx.options.texts.editNewSave(ctx, record)
				}</button>
				<a href="../" class="btn btn-light ml-1">${
					record
						? ctx.options.texts.editExistingCancel(ctx, record)
						: ctx.options.texts.editNewCancel(ctx, record)
				}</a>
			</div>
		</form>
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
 * Utility function to prepare help block. Return empty string to leave out
 * @param {CBQContext} ctx
 * @param {Object} record
 * @param {CBQField} field
 * @param {*} index
 * @return {{dom, aria}}
 */
module.exports.editFieldHelpText = (ctx, record, field, index) => {
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
 * Render a string field. This maps to an ordinary text box.
 * @param {CBQContext} ctx
 * @param {Object} record
 * @param {CBQField} field
 * @param {*} index
 */
module.exports.editFieldString = (ctx, record, field, index) => {
	assertEqual(field.type, CBQ_FIELD_TYPES.string, 'field type');

	let value = record
		? record[field.name]
		: field.defaultValue
		? getOrCall(field.defaultValue, ctx, field, index)
		: '';
	if (value === null || value === undefined) {
		value = '';
	}

	const help = ctx.options.views.editFieldHelpText(ctx, record, field, index);

	return `
	  <div class="form-group">
			<label for="${field.name}">${field.label}</label>
			<input type="text" class="form-control" name="${field.name}" id="${field.name}" value="${value}" ${help.aria} />
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

	let value = record
		? record[field.name]
		: field.defaultValue
		? getOrCall(field.defaultValue, ctx, field, index)
		: '';
	if (value === null || value === undefined) {
		value = '';
	}

	const help = ctx.options.views.editFieldHelpText(ctx, record, field, index);

	return `
	  <div class="form-group">
			<label for="${field.name}">${field.label}</label>
			<textarea class="form-control" name="${field.name}" id="${field.name}" rows="3">${value}</textarea>
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

	const selectedValue = record
		? record[field.name]
		: field.defaultValue
		? getOrCall(field.defaultValue, ctx, field, index)
		: '';

	const help = ctx.options.views.editFieldHelpText(ctx, record, field, index);

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
			<select class="form-control" name="${field.name}" id="${field.name}">${options}</select>
			${help.dom}
		</div>
	`;
};
