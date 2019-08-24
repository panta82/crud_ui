/**
 * Main page layout. Common for all pages.
 * @param {CBQContext} ctx
 * @param content
 */
function layout(ctx, content) {
	return `
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
		<meta name="description" content="">
		<meta name="author" content="">

		<title>${ctx.options.texts.listTitle(ctx)}</title>

		<link rel="stylesheet" href="/css/bootstrap.min.css" />
		<style type="text/css" rel="stylesheet">
		</style>
	</head>

	<body>

		${content}
		
		<script src="/static/js/bootstrap.min.js"></script>
	</body>
</html>
`;
}

/**
 * Render navigation menu
 */
function navigation(ctx) {
	return `
		<nav class="navbar navbar-expand-md navbar-light bg-light">

			<div class="container d-flex justify-content-between">
				<a class="navbar-brand" href="#">Navbar</a>
				<button class="navbar-toggler" type="button"
						data-toggle="collapse" data-target="#navbarsExampleDefault"
						aria-controls="navbarsExampleDefault" aria-expanded="false"
						aria-label="Toggle navigation">
					<span class="navbar-toggler-icon"></span>
				</button>

				<div class="collapse navbar-collapse" id="navbarsExampleDefault">
					<ul class="navbar-nav mr-auto">
						<li class="nav-item active">
							<a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a>
						</li>
						<li class="nav-item">
							<a class="nav-link" href="#">Link</a>
						</li>
						<li class="nav-item">
							<a class="nav-link disabled" href="#">Disabled</a>
						</li>
						<li class="nav-item dropdown">
							<a class="nav-link dropdown-toggle" href="#"
									id="dropdown01" data-toggle="dropdown" aria-haspopup="true"
									aria-expanded="false">Dropdown</a>
							<div class="dropdown-menu" aria-labelledby="dropdown01">
								<a class="dropdown-item" href="#">Action</a>
								<a class="dropdown-item" href="#">Another action</a>
								<a class="dropdown-item" href="#">Something else here</a>
							</div>
						</li>
					</ul>
					<form class="form-inline my-2 my-lg-0">
						<input class="form-control mr-sm-2" type="text"
								placeholder="Search" aria-label="Search">
						<button class="btn btn-outline-default my-2 my-sm-0"
								type="submit">Search</button>
					</form>
				</div>
			</div>

		</nav>
	`;
}

/**
 * Standard header
 * @param {CBQContext} ctx
 */
function header(ctx) {
	return `<div class="mb-5">${navigation(ctx)}</div>`;
}

/**
 * Render standard page footer, with "back to top" link and copyright.
 * @param {CBQContext} ctx
 */
function footer(ctx) {
	return `
		<footer class="text-muted mt-5">
      <div class="container">
        <hr />
        <p class="float-right">
          <a href="#">${ctx.options.texts.footerBackToTop(ctx)}</a>
        </p>
        <p>${ctx.options.texts.footerCopyright(ctx)}</p>
      </div>
    </footer>
	`;
}

// *********************************************************************************************************************

/**
 * Render error page, this is shown where everything else fails
 * @param {CBQContext} ctx
 * @param {Error} err
 */
function errorPage(ctx, err) {
	return ctx.options.views.layout(
		ctx,
		`
		${ctx.options.views.header(ctx)}
		<main class="container">
			<div class="row">
				<div class="col-md-6 offset-md-3">
					<div class="alert alert-danger">
						${err.code || err.code < 500 ? err.message : 'Internal server error'}
					</div>
				</div>
			</div>
		</main>
	`
	);
}

// *********************************************************************************************************************

/**
 * Render the entire list page. Embeds itself into layout, and renders all other parts of the list.
 * @param {CBQContext} ctx
 * @param {Array} data
 */
function listPage(ctx, data) {
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
			ctx.options.views.listColumnHeader(ctx, data, field, index)
		)}
	</tr>
</thead>
<tbody>
	${
		!data.length
			? ctx.options.views.listNoData(ctx)
			: data.map((item, index) => ctx.options.views.listRow(ctx, data, item, index)).join('\n')
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
		ctx.options.views.listCell(ctx, data, item, index, field)
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

class CBQViews {
	constructor(/** CBQViews */ source) {
		this.layout = layout;
		this.navigation = navigation;
		this.header = header;
		this.footer = footer;
		this.errorPage = errorPage;

		this.listPage = listPage;
		this.listHeader = listHeader;
		this.listAbove = listAbove;
		this.listContent = listContent;
		this.listBelow = listBelow;
		this.listFooter = listFooter;

		this.listColumnHeader = listColumnHeader;
		this.listRow = listRow;
		this.listCell = listCell;
		this.listNoData = listNoData;

		Object.assign(this, source);
	}
}

// *********************************************************************************************************************

module.exports = new CBQViews();
module.exports.CBQViews = CBQViews;
