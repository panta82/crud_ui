/**
 * @param {CBCOptions} options
 * @param content
 */
function layout(options, content) {
	return `
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
		<meta name="description" content="">
		<meta name="author" content="">

		<title>Hello world</title>

		<link rel="stylesheet" href="/css/bootstrap.min.css" />
		
		<style type="text/css" rel="stylesheet">
		</style>
	</head>

	<body>
		
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

		<main role="main" class="container">${content}</main>
		
		<footer class="text-muted">
      <div class="container">
        <hr />
        <p class="float-right">
          <a href="#">Back to top</a>
        </p>
        <p>Copyright 2019, Company</p>
      </div>
    </footer>

		<script src="/static/js/bootstrap.min.js"></script>
	</body>
</html>
`;
}

/**
 * @param {CBCOptions} options
 * @param {Array} data
 */
function list(options, data) {
	return `
<table class="table table-bordered table-sm">
<thead>
	<tr>
		${options.fields.map(f => `<th>${f.label}</th>`)}
	</tr>
</thead>
<tbody>
	${
		!data.length
			? `<tr><td colspan="100">${options.texts.listNoData}</td></tr>`
			: data.map(row).join('\n')
	}
</tbody>
</table>
	`;

	function row(item) {
		const cols = options.fields.map(field => `<td>${item[field.name] || ''}</td>`);
		return `<tr>${cols}</tr>`;
	}
}

module.exports = {
	layout,
	list,
};
