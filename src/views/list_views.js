/**
 * Render the entire list page. Embeds itself into layout, and renders all other parts of the list.
 * @param {CBQContext} ctx
 * @param {Array} data
 */
module.exports.listPage = (ctx, data) => {
	return ctx.options.views.layout(
		ctx,
		`
		${ctx.options.views.listHeader(ctx)}
		<main role="main" class="container mt-4 mb-4">
			${ctx.options.views.listAbove(ctx, data)}
			${ctx.options.views.listContent(ctx, data)}
			${ctx.options.views.listBelow(ctx, data)}
		</main>
		${ctx.options.views.listFooter(ctx, data)}
	`
	);
};

/**
 * Header for the list page
 * @param {CBQContext} ctx
 * @param {Array} data
 */
module.exports.listHeader = (ctx, data) => {
	return ctx.options.views.header(ctx);
};

/**
 * Content to be rendered above the main table
 * @param {CBQContext} ctx
 * @param {Array} data
 */
module.exports.listAbove = (ctx, data) => {
	return `<h2>${ctx.options.texts.listTitle(ctx)}</h2>`;
};

/**
 * Content to be rendered below the main table
 * @param {CBQContext} ctx
 * @param {Array} data
 */
module.exports.listBelow = (ctx, data) => {
	return '';
};

/**
 * Footer for the list page
 * @param {CBQContext} ctx
 * @param {Array} data
 */
module.exports.listFooter = (ctx, data) => {
	return ctx.options.views.footer(ctx);
};

/**
 * Render a table of items, or "no data" message
 * @param {CBQContext} ctx
 * @param {Array} data
 */
module.exports.listContent = (ctx, data) => {
	return `
<table class="table table-bordered table-sm">
<thead>
	<tr>
		${ctx.options.fields
			.map((field, index) => ctx.options.views.listColumnHeader(ctx, data, field, index))
			.join('\n')}
		<th class="shrink-cell"></th>
	</tr>
</thead>
<tbody>
	${
		!data.length
			? ctx.options.views.listNoData(ctx)
			: data.map((record, index) => ctx.options.views.listRow(ctx, data, record, index)).join('\n')
	}
</tbody>
</table>
	`;
};

/**
 * Render table header for each field
 * @param {CBQContext} ctx
 * @param {Array} data
 * @param {CBQField} field
 * @param {Number} index
 * @return {string}
 */
module.exports.listColumnHeader = (ctx, data, field, index) => {
	return `<th>${field.label}</th>`;
};

/**
 * Render a single row in list view
 * @param {CBQContext} ctx
 * @param {Array} data
 * @param {*} record
 * @param {Number} index
 * @return {string}
 */
module.exports.listRow = (ctx, data, record, index) => {
	const cols = ctx.options.fields
		.map(field => ctx.options.views.listCell(ctx, data, record, index, field))
		.join('\n');
	return `<tr>
		${cols}
		${ctx.options.views.listControlsCell(ctx, data, record, index)}
	</tr>`;
};

/**
 * Render single field of a single row in list view.
 * @param {CBQContext} ctx
 * @param {Array} data
 * @param {*} record
 * @param {Number} index
 * @param {CBQField} field
 * @return {string}
 */
module.exports.listCell = (ctx, data, record, index, field) => {
	return `<td>${record[field.name] || ''}</td>`;
};

/**
 * Render a cell with item controls (edit, delete, etc.)
 * @param {CBQContext} ctx
 * @param {Array} data
 * @param {*} record
 * @param {Number} index
 * @return {string}
 */
module.exports.listControlsCell = (ctx, data, record, index) => {
	return `
		<td class="text-nowrap">
			${ctx.options.handlers.update ? ctx.options.views.listEditButton(ctx, data, record, index) : ''}
			${ctx.options.handlers.delete ? ctx.options.views.listDeleteButton(ctx, data, record, index) : ''}
		</td>
	`;
};

/**
 * Render the edit form and button for a single item in the list view
 * @param {CBQContext} ctx
 * @param {Array} data
 * @param {*} record
 * @param {Number} index
 * @return {string}
 */
module.exports.listEditButton = (ctx, data, record, index) => {
	return `
		<a href="${ctx.url('edit/' + ctx.options.recordId(record))}" class="btn btn-primary btn-sm">Edit</a>
	`;
};

/**
 * Render the delete form and button for a single item in the list view
 * @param {CBQContext} ctx
 * @param {Array} data
 * @param {*} record
 * @param {Number} index
 * @return {string}
 */
module.exports.listDeleteButton = (ctx, data, record, index) => {
	return `
		<form method="post" class="d-inline">
			<input type="hidden" name="action" value="delete" />
			<input type="hidden" name="id" value="${ctx.options.recordId(record)}" />
			<button type="submit" class="btn btn-danger btn-sm">Delete</button>
		</form>
	`;
};

/**
 * Render "no data" message when list of items is empty
 * @param {CBQContext} ctx
 */
module.exports.listNoData = ctx => {
	return `<tr><td colspan="100">${ctx.options.texts.listNoData(ctx)}</td></tr>`;
};
