const { escapeHTML, escapeScript } = require('../tools');

/**
 * Render the entire list page. Embeds itself into layout, and renders all other parts of the list.
 * @param {CUIContext} ctx
 * @param {Array} data
 */
module.exports.listPage = (ctx, data) => {
	return ctx.options.views.layout(
		ctx,
		`
		${ctx.options.views.listHeader(ctx, data)}
		<main role="main" class="container mt-4 mb-4">
			${ctx.options.views.listAbove(ctx, data)}
			${ctx.options.views.listContent(ctx, data)}
			${ctx.options.views.listBelow(ctx, data)}
		</main>
		${ctx.options.views.listFooter(ctx, data)}
	`,
		ctx.options.views.listHead(ctx, data),
		ctx.options.views.listScripts(ctx, data)
	);
};

/**
 * Header for the list page
 * @param {CUIContext} ctx
 * @param {Array} data
 */
module.exports.listHeader = (ctx, data) => {
	return ctx.options.views.header(ctx);
};

/**
 * Content to be rendered above the main table
 * @param {CUIContext} ctx
 * @param {Array} data
 */
module.exports.listAbove = (ctx, data) => {
	return `
		<h2>${ctx.options.texts.safe.listTitle(ctx)}</h2>
		${ctx.options.actions.create ? ctx.options.views.listCreateButton(ctx, data) : ''}
	`;
};

/**
 * Render Create new record button. Only called if create new is enabled.
 * @param {CUIContext} ctx
 * @param {Array} data
 */
module.exports.listCreateButton = (ctx, data) => {
	const label = ctx.options.texts.safe.listCreateButton(ctx);
	return `
		<a href="${ctx.url(ctx.options.urls.createPage)}" class="btn btn-primary mb-3 mt-1">
			${ctx.options.views.icon(ctx, ctx.options.icons.listCreateButton, label && 'mr-1')}
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
		${ctx.options.views.footer(ctx)}
		${ctx.options.views.listDeleteConfirmationModal(ctx, data)}
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
		<script>${module.exports.listDeleteModalScripting(ctx, data)}</script>
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
			action: ctx.url(ctx.options.urls.deleteAction(id)),
			texts: {
				'modal-title': ctx.options.texts.modalConfirmDeleteTitle(ctx, data, item, index),
				'delete-modal-question': ctx.options.texts.modalConfirmDeleteQuestion(
					ctx,
					data,
					item,
					index
				),
				'delete-modal-yes': ctx.options.texts.modalConfirmDeleteYesButton(ctx, data, item, index),
				'delete-modal-no': ctx.options.texts.modalConfirmDeleteNoButton(ctx, data, item, index),
			},
		};
	}

	return `var deleteModalData = ${escapeScript(JSON.stringify(deleteModalData))};
	  document.querySelectorAll('.cui-list-delete-button').forEach(function (el) {
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
<table class="table table-bordered table-sm">
<thead>
	<tr>
		${ctx.options.fields
			.map((field, index) => ctx.options.views.listColumnHeader(ctx, data, field, index))
			.filter(Boolean)
			.join('\n')}
		<th class="cui-shrink-cell"></th>
	</tr>
</thead>
<tbody>
	${
		!data.length
			? ctx.options.views.listNoData(ctx)
			: data
					.map((record, index) => ctx.options.views.listRow(ctx, data, record, index))
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
	if (field.listView === false) {
		return null;
	}
	return `<th>${field.label}</th>`;
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
	const cols = ctx.options.fields
		.map(field => ctx.options.views.listCell(ctx, data, record, index, field))
		.filter(Boolean)
		.join('\n');

	return `
		<tr>
			${cols}
			${ctx.options.views.listControlsCell(ctx, data, record, index)}
		</tr>
	`;
};

/**
 * Render single field of a single row in list view.
 * @param {CUIContext} ctx
 * @param {Array} data
 * @param {*} record
 * @param {Number} index
 * @param {CUIField} field
 * @return {string}
 */
module.exports.listCell = (ctx, data, record, index, field) => {
	if (field.listView === false) {
		return null;
	}

	return `<td>${ctx.options.views.listValue(ctx, data, record, index, field)}</td>`;
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
	if (typeof field.listView === 'function') {
		// Use custom renderer
		return field.listView(record[field.name], record, ctx, field, data, index);
	}

	let value = record[field.name];
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
		<td class="text-nowrap">
			${ctx.options.actions.update ? ctx.options.views.listEditButton(ctx, data, record, index) : ''}
			${ctx.options.actions.delete ? ctx.options.views.listDeleteButton(ctx, data, record, index) : ''}
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
module.exports.listEditButton = (ctx, data, record, index) => {
	const label = ctx.options.texts.safe.listEditButton(ctx);
	return `
		<a href="${ctx.url(
			ctx.options.urls.editPage(ctx.options.recordId(record))
		)}" class="btn btn-primary btn-sm">
			${ctx.options.views.icon(ctx, ctx.options.icons.listEditButton, label && 'mr-1')}
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
	const label = ctx.options.texts.safe.listDeleteButton(ctx);
	return `
		<button type="submit" class="btn btn-danger btn-sm cui-list-delete-button" data-delete-id="${escapeHTML(
			ctx.options.recordId(record)
		)}">
			${ctx.options.views.icon(ctx, ctx.options.icons.listDeleteButton, label && 'mr-1')}
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
		<div class="modal fade" tabindex="-1" role="dialog" id="delete_modal">
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
							${ctx.options.views.csrfField(ctx)}
							<button type="submit" class="btn btn-danger">
								${ctx.options.views.icon(ctx, ctx.options.icons.modalConfirmDeleteYesButton, 'mr-1')}
								<span class="delete-modal-yes"></span>
							</button>
						</form>
						<button type="button" class="btn btn-secondary" data-dismiss="modal">
							${ctx.options.views.icon(ctx, ctx.options.icons.modalConfirmDeleteNoButton, 'mr-1')}
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
	return `<tr><td colspan="100">${ctx.options.texts.safe.listNoData(ctx)}</td></tr>`;
};
