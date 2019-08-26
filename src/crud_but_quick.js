const libPath = require('path');

const express = require('express');

const { CBQOptions, CBQContext } = require('./types');

/**
 * Create express.js router that will serve a CRUD ui
 * @param {CBQOptions} options
 */
function crudButQuick(options) {
	options = new CBQOptions(options);

	options.validateAndCoerce();

	const router = express.Router();

	router.use(express.static(libPath.resolve(__dirname, '../static')));

	router.get('/', (req, res, next) => {
		Promise.resolve()
			.then(() => options.list())
			.then(data => {
				if (!data) {
					throw new Error(`Invalid data`);
				}

				const ctx = new CBQContext(options);
				return options.views.list.page(ctx, data);
			})
			.then(html => {
				res.header('Content-Type', 'text/html').send(html);
			}, next);
	});

	router.use((err, req, res, next) => {
		const ctx = new CBQContext(options);

		if (options.onError) {
			options.onError(ctx, err);
		}

		const errHtml = options.views.errorPage(ctx, err);
		res
			.status(err.code || 500)
			.header('Content-Type', 'text/html')
			.send(errHtml);
	});

	return router;
}

module.exports = {
	crudButQuick,
};
