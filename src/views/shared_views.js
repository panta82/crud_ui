/**
 * Main page layout. Common for all pages.
 * @param {CUIContext} ctx
 * @param content
 * @param head
 * @param scripts
 */
module.exports.layout = (ctx, content, head = '', scripts = '') => {
	return `
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
		<meta name="description" content="">
		<meta name="author" content="">

		<title>${ctx.options.texts.safe.listTitle(ctx)}</title>

		<link rel="stylesheet" href="${ctx.url('/css/bootstrap.min.css')}" />
		<link rel="stylesheet" href="${ctx.url('/css/styles.css')}" />
		${head || ''}
	</head>

	<body>

		${content}
		
		<script src="${ctx.url('/js/jquery-3.4.1.slim.js')}"></script>
		<script src="${ctx.url('/js/bootstrap.min.js')}"></script>
		<script src="${ctx.url('/js/scripts.js')}"></script>
		${scripts || ''}
	</body>
</html>
`;
};

/**
 * Standard header
 * @param {CUIContext} ctx
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
 * @param {CUIContext} ctx
 */
module.exports.footer = ctx => {
	return `
		<footer class="text-muted mt-5">
      <div class="container">
        <hr />
        <p class="float-right">
          <a href="#">${ctx.options.texts.safe.footerBackToTop(ctx)}</a>
        </p>
        <p>${ctx.options.texts.safe.footerCopyright(ctx)}</p>
      </div>
    </footer>
	`;
};

/**
 * Render navigation menu
 * @param {CUIContext} ctx
 */
module.exports.navigation = ctx => {
	if (!ctx.options.navigation) {
		// No navigation
		return '';
	}

	const left = ctx.options.navigation.left
		? ctx.options.navigation.left
				.map((item, index) => ctx.options.views.navigationItem(ctx, item, index, false))
				.join('\n')
		: '';
	const right = ctx.options.navigation.right
		? ctx.options.navigation.right
				.map((item, index) => ctx.options.views.navigationItem(ctx, item, index, true))
				.join('\n')
		: '';

	return `
		<nav class="navbar navbar-expand-md navbar-light bg-light">
			<div class="container d-flex justify-content-between">
				<a class="navbar-brand" href="${ctx.options.navigation.brand.url || '#'}">
					${ctx.options.navigation.brand.title}
				</a>
				<button class="navbar-toggler" type="button"
						data-toggle="collapse" data-target="#navbar_content"
						aria-controls="navbar_content" aria-expanded="false"
						aria-label="Toggle navigation">
					<span class="navbar-toggler-icon"></span>
				</button>

				<div class="collapse navbar-collapse" id="navbar_content">
					<ul class="nav navbar-nav mr-auto">
						${left}
					</ul>
					<ul class="nav navbar-nav ml-auto">
						${right}
					</ul>
				</div>
			</div>
		</nav>
	`;
};

/**
 * Render navigation menu item
 * @param {CUIContext} ctx
 * @param {CUINavigationItem} item
 * @param {number} index
 * @param {boolean} isRight
 */
module.exports.navigationItem = (ctx, item, index, isRight) => {
	if (item.render) {
		return item.render(ctx, item, index, isRight);
	}

	if (!item.items) {
		// Render as plain item
		const url = item.url || '#';
		return `
			<li class="nav-item ${url.indexOf(ctx.baseUrl) === 0 ? 'active' : ''}">
				<a class="nav-link" href="${url}">${item.title}</a>
			</li>
		`;
	}

	// Render as dropdown menu
	const menuItems = item.items
		.map((menuItem, menuIndex) =>
			ctx.options.views.navigationDropDownItem(ctx, menuItem, menuIndex, isRight, item, index)
		)
		.join('\n');

	return `
		<li class="nav-item dropdown">
			<a class="nav-link dropdown-toggle" href="#"
					id="cui_navigation_dropdown" data-toggle="dropdown" aria-haspopup="true"
					aria-expanded="false">${item.title}</a>
			<div class="dropdown-menu ${
				isRight ? 'dropdown-menu-right' : ''
			}" aria-labelledby="cui_navigation_dropdown">
				${menuItems}
			</div>
		</li>
	`;
};

/**
 * Render an item inside a navigation menu dropdown list
 * @param {CUIContext} ctx
 * @param {CUINavigationItem} item
 * @param {number} index
 * @param {boolean} isRight
 * @param {CUINavigationItem} parentItem
 * @param parentIndex
 */
module.exports.navigationDropDownItem = (ctx, item, index, isRight, parentItem, parentIndex) => {
	if (item.render) {
		return item.render(ctx, item, index, isRight, parentItem, parentIndex);
	}

	if (item.title.indexOf('---') === 0) {
		return `<div class="dropdown-divider"></div>`;
	}

	const url = item.url || '#';
	return `
		<a class="dropdown-item ${url.indexOf(ctx.baseUrl) === 0 ? 'active' : ''}" href="${url}">
			${item.title}
		</a>
	`;
};

/**
 * Render navigation menu
 * @param {CUIContext} ctx
 */
module.exports.flashMessage = ctx => {
	if (!ctx.flash.message) {
		return '';
	}
	return `
		<div class="cui-flash-message alert alert-${ctx.flash.flavor ||
			'success'} fade show px-0 py-1 position-absolute w-100 my-0" role="alert">
			<div class="container">
				${ctx.flash.message}
			</div>
		</div>
	`;
};

// *********************************************************************************************************************

/**
 * Render a CSRF field
 * @param {CUIContext} ctx
 */
module.exports.csrfField = ctx => {
	return `<input type="hidden" name="${ctx.csrf.field}" value="${ctx.csrf.value}" />`;
};

/**
 * Render error page, this is shown where everything else fails
 * @param {CUIContext} ctx
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
