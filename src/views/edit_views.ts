import { assertEqual, capitalize, getOrCall } from '../tools';
import { CUIContext } from '../types/context';
import { CUIField } from '../types/fields';

/**
 * Renders edit page. This covers both editing existing record and creating a new one
 */
export const editPage = <T>(ctx: CUIContext, record: T) => {
  return ctx.views.layout(
    ctx,
    record
      ? ctx.texts.safe.editExistingPageTitle(ctx, record)
      : ctx.texts.safe.editNewPageTitle(ctx),
    `cui-page-edit cui-page-edit-${record ? 'existing' : 'new'}`,
    `
		${ctx.views.editHeader(ctx, record)}
		<main role="main" class="container mt-4 mb-4">
			${ctx.views.editAbove(ctx, record)}
			${ctx.views.editContent(ctx, record)}
			${ctx.views.editBelow(ctx, record)}
		</main>
		${ctx.views.editFooter(ctx, record)}
	`
  );
};

/**
 * Header for the edit page
 */
export const editHeader = <T>(ctx: CUIContext, record: T) => {
  return ctx.views.header(ctx);
};

/**
 * Content to be rendered above the edit form. Should probably include the title.
 */
export const editAbove = <T>(ctx: CUIContext, record: T) => {
  return `
		<h2 class="mb-5 cui-page-title">${
      record ? ctx.texts.safe.editExistingTitle(ctx, record) : ctx.texts.safe.editNewTitle(ctx)
    }</h2>
		${ctx.views.editErrorSummary(ctx, record)}`;
};

/**
 * Content to be rendered below the main form
 */
export const editBelow = <T>(ctx: CUIContext, record: T) => {
  return '';
};

/**
 * Footer for the edit page
 */
export const editFooter = <T>(ctx: CUIContext, record: T) => {
  return ctx.views.footer(ctx);
};

/**
 * Render a form to edit data
 */
export const editContent = <T>(ctx: CUIContext, record: T) => {
  return `
		<form method="post" class="cui-main-form">
			${ctx.views.csrfField(ctx)}
			${ctx.fields
        .map((field, index) => {
          return ctx.views.editField(ctx, record, field, index);
        })
        .filter(Boolean)
        .join('\n')}
			<div>
				${ctx.views.editSaveButton(ctx, record)}
				${ctx.views.editCancelButton(ctx, record)}
			</div>
		</form>
	`;
};

/**
 * Save button on the edit form
 */
export const editSaveButton = <T>(ctx: CUIContext, record: T) => {
  const label = record
    ? ctx.texts.safe.editExistingSaveButton(ctx, record)
    : ctx.texts.safe.editNewSaveButton(ctx);
  const title = record
    ? ctx.texts.safe.editExistingSaveButtonTitle(ctx, record)
    : ctx.texts.safe.editNewSaveButtonTitle(ctx);
  const icon = record
    ? ctx.views.icon(ctx, ctx.icons.editExistingSaveButton, label && 'mr-1')
    : ctx.views.icon(ctx, ctx.icons.editNewSaveButton, label && 'mr-1');
  return `
		<button type="submit" class="btn btn-success cui-submit-button" title="${title}">
			${icon}
			${label}
		</button>
	`;
};

/**
 * Cancel button on the edit form
 */
export const editCancelButton = <T>(ctx: CUIContext, record: T) => {
  const label = record
    ? ctx.texts.safe.editExistingCancelButton(ctx, record)
    : ctx.texts.safe.editNewCancelButton(ctx);
  const title = record
    ? ctx.texts.safe.editExistingCancelButtonTitle(ctx, record)
    : ctx.texts.safe.editNewCancelButtonTitle(ctx);
  const icon = record
    ? ctx.views.icon(ctx, ctx.icons.editExistingCancelButton, label && 'mr-1')
    : ctx.views.icon(ctx, ctx.icons.editNewCancelButton, label && 'mr-1');
  const backUrl = ctx.url(
    ctx.routeName === 'detailEditPage' ? ctx.routes.detailPage(ctx.idParam) : ctx.routes.indexPage
  );
  return `
		<a href="${backUrl}" class="btn btn-light ml-1 cui-cancel-button" title="${title}">
			${icon}
			${label}
		</a>
	`;
};

/**
 * If error is present and error summary is enabled,
 * renders a red box with error message and all faults above the form.
 */
export const editErrorSummary = <T>(ctx: CUIContext, record: T) => {
  if (!('error' in ctx.flash)) {
    return '';
  }

  if (!ctx.tweaks.showValidationErrorSummary) {
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
 */
export const editField = <T>(ctx: CUIContext, record: T, field: CUIField, index: number) => {
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
    case 'string':
      return ctx.views.editFieldString(ctx, record, field, index);
    case 'secret':
      return ctx.views.editFieldSecret(ctx, record, field, index);
    case 'text':
      return ctx.views.editFieldText(ctx, record, field, index);
    case 'select':
      return ctx.views.editFieldSelect(ctx, record, field, index);
    case 'boolean':
      return ctx.views.editFieldBoolean(ctx, record, field, index);
  }

  throw new TypeError(`Invalid field type: ${field.type}`);
};

/**
 * Utility function to prepare help block. Must return an object.
 */
export const editFieldPrepareHelp = <T>(
  ctx: CUIContext,
  record: T,
  field: CUIField,
  index: number
): { dom: string; aria: string } => {
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
 */
export const editFieldPrepareError = <T>(
  ctx: CUIContext,
  record: T,
  field: CUIField,
  index: number
): { dom: string; class: string } => {
  const faults =
    'error' in ctx.flash && ctx.flash.error.byFieldName && ctx.flash.error.byFieldName[field.name];
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
 */
export const editFieldPrepareValue = <T>(
  ctx: CUIContext,
  record: T,
  field: CUIField,
  index: number
) => {
  let value;
  if ('error' in ctx.flash && ctx.flash.error.payload) {
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
 */
export const editFieldString = <T>(ctx: CUIContext, record: T, field: CUIField, index: number) => {
  assertEqual(field.type, 'string', 'field type');

  const help = ctx.views.editFieldPrepareHelp(ctx, record, field, index);
  const error = ctx.views.editFieldPrepareError(ctx, record, field, index);
  const value = ctx.views.editFieldPrepareValue(ctx, record, field, index);

  return `
	  <div class="form-group cui-field-edit cui-field-name-${field.name} cui-field-string" data-field-name="${field.name}">
			<label for="${field.name}">${field.label}</label>
			<input type="text" class="form-control ${error.class}" name="${field.name}" id="${field.name}" value="${value}" ${help.aria} />
			${error.dom}
			${help.dom}
		</div>
	`;
};

/**
 * Render a secret field. This maps to a password text box.
 */
export const editFieldSecret = <T>(ctx: CUIContext, record: T, field: CUIField, index: number) => {
  assertEqual(field.type, 'secret', 'field type');

  const help = ctx.views.editFieldPrepareHelp(ctx, record, field, index);
  const error = ctx.views.editFieldPrepareError(ctx, record, field, index);
  const value = ctx.views.editFieldPrepareValue(ctx, record, field, index);

  return `
	  <div class="form-group cui-field-edit cui-field-name-${field.name} cui-field-secret" data-field-name="${field.name}">
			<label for="${field.name}">${field.label}</label>
			<input type="password" class="form-control ${error.class}" name="${field.name}" id="${field.name}" value="${value}" ${help.aria} />
			${error.dom}
			${help.dom}
		</div>
	`;
};

/**
 * Render a text field. This maps to a text area.
 */
export const editFieldText = <T>(ctx: CUIContext, record: T, field: CUIField, index: number) => {
  assertEqual(field.type, 'text', 'field type');

  const help = ctx.views.editFieldPrepareHelp(ctx, record, field, index);
  const error = ctx.views.editFieldPrepareError(ctx, record, field, index);
  const value = ctx.views.editFieldPrepareValue(ctx, record, field, index);

  return `
	  <div class="form-group cui-field-edit cui-field-name-${field.name} cui-field-text" data-field-name="${field.name}">
			<label for="${field.name}">${field.label}</label>
			<textarea class="form-control ${error.class}" name="${field.name}" id="${field.name}" rows="3">${value}</textarea>
			${error.dom}
			${help.dom}
		</div>
	`;
};

/**
 * Render a select field. Uses DOM select element
 */
export const editFieldSelect = <T>(ctx: CUIContext, record: T, field: CUIField, index: number) => {
  assertEqual(field.type, 'select', 'field type');

  const help = ctx.views.editFieldPrepareHelp(ctx, record, field, index);
  const error = ctx.views.editFieldPrepareError(ctx, record, field, index);
  const selectedValue = ctx.views.editFieldPrepareValue(ctx, record, field, index);

  const values = getOrCall(field.values, ctx);

  const options = values.map(v => {
    const value = v.value || v;
    const label = v.label || v;
    const selected = selectedValue === value ? 'selected="selected"' : '';
    return `<option value="${value}" title="${v.title || ''}" ${selected}>${label}</option>`;
  });

  if (typeof field.nullOption === 'string' || field.nullOption === true) {
    // Add null option
    options.unshift(
      `<option value="" ${!selectedValue ? 'selected="selected"' : ''}>${
        field.nullOption !== true && field.nullOption.length ? field.nullOption : ''
      }</option>`
    );
  }

  return `
	  <div class="form-group cui-field-edit cui-field-name-${field.name} cui-field-select" data-field-name="${field.name}">
			<label for="${field.name}">${field.label}</label>
			<select class="form-control ${error.class}" name="${field.name}" id="${field.name}">${options}</select>
			${error.dom}
			${help.dom}
		</div>
	`;
};

/**
 * Render a boolean field. This maps to a single checkbox.
 */
export const editFieldBoolean = <T>(ctx: CUIContext, record: T, field: CUIField, index: number) => {
  assertEqual(field.type, 'boolean', 'field type');

  const help = ctx.views.editFieldPrepareHelp(ctx, record, field, index);
  const error = ctx.views.editFieldPrepareError(ctx, record, field, index);
  const value = ctx.views.editFieldPrepareValue(ctx, record, field, index);

  return `
	  <div class="form-group form-check cui-field-edit cui-field-name-${
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
