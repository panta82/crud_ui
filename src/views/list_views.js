'use strict';

const { escapeHTML, escapeScript } = require('../tools');
const { CUI_FIELD_TYPES, CUI_MODES } = require('../types/consts');

/**
 * Render the entire list page. Embeds itself into layout, and renders all other parts of the list.
 * @param {CUIContext} ctx
 * @param {Array} data
 */
module.exports.listPage = (ctx, data) => {
	return ctx.views.layout(
		ctx,
		ctx.texts.safe.listPageTitle(ctx),
		'cui-page-list',
		`
		${ctx.views.listHeader(ctx, data)}
		<main role="main" class="container mt-4 mb-4">
			${ctx.views.listAbove(ctx, data)}
			${ctx.views.listContent(ctx, data)}
			${ctx.views.listBelow(ctx, data)}
		</main>
		${ctx.views.listFooter(ctx, data)}
	`,
		ctx.views.listHead(ctx, data),
		ctx.views.listScripts(ctx, data)
	);
};

/**
 * Header for the list page
 * @param {CUIContext} ctx
 * @param {Array} data
 */
module.exports.listHeader = (ctx, data) => {
	return ctx.views.header(ctx);
};

/**
 * Content to be rendered above the main table
 * @param {CUIContext} ctx
 * @param {Array} data
 */
module.exports.listAbove = (ctx, data) => {
	return `
		<h2 class="cui-page-title">${ctx.texts.safe.listTitle(ctx)}</h2>
		${ctx.actions.create ? ctx.views.listCreateButton(ctx, data) : ''}
	`;
};

/**
 * Render Create new record button. Only called if create new is enabled.
 * @param {CUIContext} ctx
 * @param {Array} data
 */
module.exports.listCreateButton = (ctx, data) => {
	const label = ctx.texts.safe.listCreateButton(ctx);
	return `
		<a href="${ctx.url(ctx.routes.createPage)}" class="btn btn-primary mb-3 mt-1 cui-create-button"
				title="${ctx.texts.safe.listCreateButtonTitle(ctx)}">
			${ctx.views.icon(ctx, ctx.icons.listCreateButton, label && 'mr-1')}
			${label}
		</a>
	`;
};

/**
 * Content to be rendered below the main table
 * @param {CUIContext} ctx
 * @param {Array} data
 */
module.exports.listBelow = (ctx, data) => {
	return '';
};

/**
 * Footer for the list page
 * @param {CUIContext} ctx
 * @param {Array} data
 */
module.exports.listFooter = (ctx, data) => {
	return `
		${ctx.views.footer(ctx)}
		${ctx.views.listDeleteConfirmationModal(ctx, data)}
	`;
};

/**
 * Stuff to add to head of the list page (styles, meta-tags...)
 * @param {CUIContext} ctx
 * @param {Array} data
 */
module.exports.listHead = (ctx, data) => {
	return '';
};

/**
 * Stuff to add at the very bottom, in the scripts section.
 * @param {CUIContext} ctx
 * @param {Array} data
 */
module.exports.listScripts = (ctx, data) => {
	return `
		<script>${ctx.views.listDeleteModalScripting(ctx, data)}</script>
	`;
};

/**
 * Scripting to enable functionality of the delete record modal. Should produce result in pure javascript.
 * WARNING: The product of this function must be escaped with escapeScript to be safely embedded in a script tag
 * @param {CUIContext} ctx
 * @param {Array} data
 */
module.exports.listDeleteModalScripting = (ctx, data) => {
	const deleteModalData = {};
	for (let index = 0; index < data.length; index++) {
		const item = data[index];

		const id = ctx.options.recordId(item);
		deleteModalData[id] = {
			action: ctx.url(ctx.routes.deleteAction(id)),
			texts: {
				'modal-title': ctx.texts.listConfirmDeleteTitle(ctx, data, item, index),
				'delete-modal-question': ctx.texts.listConfirmDeleteQuestion(ctx, data, item, index),
				'delete-modal-yes': ctx.texts.listConfirmDeleteYesButton(ctx, data, item, index),
				'delete-modal-no': ctx.texts.listConfirmDeleteNoButton(ctx, data, item, index),
			},
		};
	}

	return `var deleteModalData = ${escapeScript(JSON.stringify(deleteModalData))};
	  document.querySelectorAll('.cui-delete-button').forEach(function (el) {
	    var id = el.getAttribute('data-delete-id');
	    var data = deleteModalData[id];
	    if (data) {
	      el.addEventListener('click', function () {
	        showModal('delete_modal', data.action, data.texts);
	      });
	    }
	  });
	`;
};

/**
 * Render a table of items, or "no data" message
 * @param {CUIContext} ctx
 * @param {Array} data
 */
module.exports.listContent = (ctx, data) => {
	return `
<table class="table table-bordered table-sm cui-list-table">
<thead>
	<tr>
		${ctx.fields
			.map((field, index) => ctx.views.listColumnHeader(ctx, data, field, index))
			.filter(Boolean)
			.join('\n')}
		<th class="cui-shrink-cell cui-controls-cell"></th>
	</tr>
</thead>
<tbody>
	${
		!data.length
			? ctx.views.listNoData(ctx)
			: data
					.map((record, index) => ctx.views.listRow(ctx, data, record, index))
					.filter(Boolean)
					.join('\n')
	}
</tbody>
</table>
	`;
};

/**
 * Render table header for each field
 * @param {CUIContext} ctx
 * @param {Array} data
 * @param {CUIField} field
 * @param {Number} index
 * @return {string}
 */
module.exports.listColumnHeader = (ctx, data, field, index) => {
	if (!field.allowList) {
		return null;
	}
	return `
		<th class="cui-field-name-${field.name} cui-field-index-${index}" data-field-name="${field.name}">
			${field.title}
		</th>`;
};

/**
 * Render a single row in list view
 * @param {CUIContext} ctx
 * @param {Array} data
 * @param {*} record
 * @param {Number} index
 * @return {string}
 */
module.exports.listRow = (ctx, data, record, index) => {
	const cols = ctx.fields
		.map(field => ctx.views.listCell(ctx, data, record, index, field))
		.filter(Boolean)
		.join('\n');

	return `
		<tr class="cui-row-index-${index}" data-record-id="${escapeHTML(ctx.options.recordId(record))}">
			${cols}
			${ctx.views.listControlsCell(ctx, data, record, index)}
		</tr>
	`;
};

/**
 * Render single field of a single row in list view.
 * @param {CUIContext} ctx
 * @param {Array} data
 * @param {*} record
 * @param {Number} recordIndex
 * @param {CUIField} field
 * @return {string}
 */
module.exports.listCell = (ctx, data, record, recordIndex, field) => {
	if (!field.allowList) {
		return null;
	}

	return `
		<td class="cui-field-name-${field.name} cui-field-type-${field.type}" data-field-name="${
		field.name
	}">
			${ctx.views.listValue(ctx, data, record, recordIndex, field)}
		</td>`;
};

/**
 * Format and render CMS value in table view.
 * WARNING: This output must be HTML escaped!
 * @param {CUIContext} ctx
 * @param {Array} data
 * @param {*} record
 * @param {Number} index
 * @param {CUIField} field
 * @return {string}
 */
module.exports.listValue = (ctx, data, record, index, field) => {
	if (field.listView) {
		// Use custom renderer
		const customView = field.listView(record[field.name], ctx, data, record, index, field);
		if (customView !== undefined) {
			return customView;
		}
	}

	if (field.type === CUI_FIELD_TYPES.secret) {
		// Do not display secrets by default
		return `<span class="text-muted">••••••••</span>`;
	}

	let value = record[field.name];

	if (field.type === CUI_FIELD_TYPES.boolean) {
		// Display as icon
		return ctx.views.icon(ctx, value ? ctx.icons.booleanTrue : ctx.icons.booleanFalse);
	}

	if (value === null || value === undefined) {
		value = '';
	}
	// TODO: More formatting for different occasions.
	return escapeHTML(value);
};

/**
 * Render a cell with item controls (edit, delete, etc.)
 * @param {CUIContext} ctx
 * @param {Array} data
 * @param {*} record
 * @param {Number} index
 * @return {string}
 */
module.exports.listControlsCell = (ctx, data, record, index) => {
	return `
		<td class="text-nowrap cui-controls-cell">
			${ctx.views.listDetailButton(ctx, data, record, index)}
			${ctx.views.listEditButton(ctx, data, record, index)}
			${ctx.views.listDeleteButton(ctx, data, record, index)}
		</td>
	`;
};

/**
 * Render the edit form and button for a single item in the list view
 * @param {CUIContext} ctx
 * @param {Array} data
 * @param {*} record
 * @param {Number} index
 * @return {string}
 */
module.exports.listDetailButton = (ctx, data, record, index) => {
	if (ctx.options.mode === CUI_MODES.simple_list) {
		// Simple list mode doesn't have detail view
		return '';
	}
	const label = ctx.texts.safe.listDetailButton(ctx);
	return `
		<a href="${ctx.url(
			ctx.routes.detailPage(ctx.options.recordId(record))
		)}" class="btn btn-secondary btn-sm cui-details-button" title="${ctx.texts.safe.listDetailButtonTitle(
		ctx
	)}">
			${ctx.views.icon(ctx, ctx.icons.listDetailButton, label && 'mr-1')}
			${label}
		</a>
	`;
};

/**
 * Render the edit form and button for a single item in the list view
 * @param {CUIContext} ctx
 * @param {Array} data
 * @param {*} record
 * @param {Number} index
 * @return {string}
 */
module.exports.listEditButton = (ctx, data, record, index) => {
	if (!ctx.actions.update) {
		// Don't support edit
		return '';
	}

	const label = ctx.texts.safe.listEditButton(ctx);
	return `
		<a href="${ctx.url(
			ctx.routes.editPage(ctx.options.recordId(record))
		)}" class="btn btn-primary btn-sm cui-edit-button" title="${ctx.texts.safe.listEditButtonTitle(
		ctx
	)}">
			${ctx.views.icon(ctx, ctx.icons.listEditButton, label && 'mr-1')}
			${label}
		</a>
	`;
};

/**
 * Render the delete form and button for a single item in the list view
 * @param {CUIContext} ctx
 * @param {Array} data
 * @param {*} record
 * @param {Number} index
 * @return {string}
 */
module.exports.listDeleteButton = (ctx, data, record, index) => {
	if (!ctx.actions.delete) {
		// Don't support delete
		return '';
	}

	const label = ctx.texts.safe.listDeleteButton(ctx);
	return `
		<button type="button" class="btn btn-danger btn-sm cui-delete-button" data-delete-id="${escapeHTML(
			ctx.options.recordId(record)
		)}" title="${ctx.texts.safe.listDeleteButtonTitle(ctx)}">
			${ctx.views.icon(ctx, ctx.icons.listDeleteButton, label && 'mr-1')}
			${label}
		</button>
	`;
};

/**
 * Render "are you sure?" modal for deleting items.
 * @param {CUIContext} ctx
 * @param {Array} data
 * @return {string}
 */
module.exports.listDeleteConfirmationModal = (ctx, data) => {
	// NOTE: We are not accounting for margin in buttons if user sets no text. No easy way to do it with current system,
	//       and probably not worth worrying about it for a pretty niche use case. Revisit if it turns out to matter.
	return `
		<div class="modal fade cui-delete-modal" tabindex="-1" role="dialog" id="delete_modal">
			<div class="modal-dialog" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title"></h5>
						<button type="button" class="close" data-dismiss="modal" aria-label="Close">
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div class="modal-body">
						<p class="delete-modal-question"></p>
					</div>
					<div class="modal-footer">
						<form method="post" action="" class="d-inline">
							${ctx.views.csrfField(ctx)}
							<button type="submit" class="btn btn-danger">
								${ctx.views.icon(ctx, ctx.icons.listConfirmDeleteYesButton, 'mr-1')}
								<span class="delete-modal-yes"></span>
							</button>
						</form>
						<button type="button" class="btn btn-secondary" data-dismiss="modal">
							${ctx.views.icon(ctx, ctx.icons.listConfirmDeleteNoButton, 'mr-1')}
							<span class="delete-modal-no"></span>
						</button>
					</div>
				</div>
			</div>
		</div>
		`;
};

/**
 * Render "no data" message when list of items is empty
 * @param {CUIContext} ctx
 */
module.exports.listNoData = ctx => {
	return `
		<tr>
			<td class="cui-no-data-placeholder" colspan="100">
				${ctx.texts.safe.listNoData(ctx)}
			</td>
		</tr>`;
};
