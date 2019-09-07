/**
 * Main page layout. Common for all pages.
 * @param {CBQContext} ctx
 * @param content
 */
module.exports.layout = (ctx, content) => {
	return `
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
		<meta name="description" content="">
		<meta name="author" content="">

		<title>${ctx.options.texts.listTitle(ctx)}</title>

		<link rel="stylesheet" href="${ctx.url('/css/bootstrap.min.css')}" />
		<link rel="stylesheet" href="${ctx.url('/css/styles.css')}" />
	</head>

	<body>

		${content}
		
		<script src="${ctx.url('/js/cbq-scripts.js')}"></script>
	</body>
</html>
`;
};

/**
 * Standard header
 * @param {CBQContext} ctx
 */
module.exports.header = ctx => {
	return `
		<div class="mb-5">
			${ctx.options.views.navigation(ctx)}
			${ctx.options.views.flashMessage(ctx)}
		</div>
	`;
};

/**
 * Render standard page footer, with "back to top" link and copyright.
 * @param {CBQContext} ctx
 */
module.exports.footer = ctx => {
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
};

/**
 * Render navigation menu
 */
module.exports.navigation = ctx => {
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
};

/**
 * Render navigation menu
 * @param {CBQContext} ctx
 */
module.exports.flashMessage = ctx => {
	if (ctx.req.flash && ctx.req.flash.message) {
		return `
			<div class="cbq-flash-message alert alert-${ctx.req.flash.flavor ||
				'success'} fade show px-0 py-1 position-absolute w-100 my-0" role="alert">
				<div class="container">
					${ctx.req.flash.message}
				</div>
			</div>
		`;
	}
	return '';
};

// *********************************************************************************************************************

/**
 * Render error page, this is shown where everything else fails
 * @param {CBQContext} ctx
 * @param {Error} err
 */
module.exports.errorPage = (ctx, err) => {
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
};
