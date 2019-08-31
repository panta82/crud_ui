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
			<div class="form-group">
				<label for="test">Label</label>
				<input type="text" class="form-control" name="test" id="test" value="test" />
			</div>
		</form>
	`;
};
