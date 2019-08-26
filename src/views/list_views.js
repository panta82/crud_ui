/**
 * Render the entire list page. Embeds itself into layout, and renders all other parts of the list.
 * @param {CBQContext} ctx
 * @param {Array} data
 */
function listPage(ctx, data) {
	return ctx.options.views.layout(
		ctx,
		`
		${ctx.options.views.list.header(ctx)}
		<main role="main" class="container mt-4 mb-4">
			${ctx.options.views.list.above(ctx, data)}
			${ctx.options.views.list.content(ctx, data)}
			${ctx.options.views.list.below(ctx, data)}
		</main>
		${ctx.options.views.list.footer(ctx, data)}
	`
	);
}

/**
 * Footer for the list page
 * @param {CBQContext} ctx
 * @param {Array} data
 */
function listHeader(ctx, data) {
	return ctx.options.views.header(ctx);
}

/**
 * Content to be rendered above the main table
 * @param {CBQContext} ctx
 * @param {Array} data
 */
function listAbove(ctx, data) {
	return `<h2>${ctx.options.texts.listTitle(ctx)}</h2>`;
}

/**
 * Content to be rendered below the main table
 * @param {CBQContext} ctx
 * @param {Array} data
 */
function listBelow(ctx, data) {
	return '';
}

/**
 * Footer for the list page
 * @param {CBQContext} ctx
 * @param {Array} data
 */
function listFooter(ctx, data) {
	return ctx.options.views.footer(ctx);
}

/**
 * Render a table of items, or "no data" message
 * @param {CBQContext} ctx
 * @param {Array} data
 */
function listContent(ctx, data) {
	return `
<table class="table table-bordered table-sm">
<thead>
	<tr>
		${ctx.options.fields.map((field, index) =>
			ctx.options.views.list.columnHeader(ctx, data, field, index)
		)}
	</tr>
</thead>
<tbody>
	${
		!data.length
			? ctx.options.views.list.noData(ctx)
			: data.map((item, index) => ctx.options.views.list.row(ctx, data, item, index)).join('\n')
	}
</tbody>
</table>
	`;
}

/**
 * Render table header for each field
 * @param {CBQContext} ctx
 * @param {Array} data
 * @param {CBQField} field
 * @param {Number} index
 * @return {string}
 */
function listColumnHeader(ctx, data, field, index) {
	return `<th>${field.label}</th>`;
}

/**
 * Render a single row in list view
 * @param {CBQContext} ctx
 * @param {Array} data
 * @param {*} item
 * @param {Number} index
 * @return {string}
 */
function listRow(ctx, data, item, index) {
	const cols = ctx.options.fields.map(field =>
		ctx.options.views.list.cell(ctx, data, item, index, field)
	);
	return `<tr>${cols}</tr>`;
}

/**
 * Render single field of a single row in list view.
 * @param {CBQContext} ctx
 * @param {Array} data
 * @param {*} item
 * @param {Number} index
 * @param {CBQField} field
 * @return {string}
 */
function listCell(ctx, data, item, index, field) {
	return `<td>${item[field.name] || ''}</td>`;
}

/**
 * Render "no data" message when list of items is empty
 * @param {CBQContext} ctx
 */
function listNoData(ctx) {
	return `<tr><td colspan="100">${ctx.options.texts.listNoData(ctx)}</td></tr>`;
}

// *********************************************************************************************************************

class CBQListViews {
	constructor(/** CBQListViews */ source) {
		this.page = listPage;
		this.header = listHeader;
		this.above = listAbove;
		this.content = listContent;
		this.below = listBelow;
		this.footer = listFooter;

		this.columnHeader = listColumnHeader;
		this.row = listRow;
		this.cell = listCell;
		this.noData = listNoData;

		Object.assign(this, source);
	}
}

module.exports = {
	CBQListViews,
};
