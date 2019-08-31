const libPath = require('path');

const express = require('express');

const { CBQOptions, CBQContext, CBQError } = require('./types');
const { capitalize, singularize } = require('./tools');

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
		const ctx = new CBQContext(options);
		Promise.resolve()
			.then(() => options.handlers.list(ctx))
			.then(data => {
				if (!data) {
					throw new CBQError(`Invalid data`);
				}

				return options.views.listPage(ctx, data);
			})
			.then(html => {
				res.header('Content-Type', 'text/html').send(html);
			}, next);
	});

	router.get('/edit/:id', (req, res, next) => {
		const ctx = new CBQContext(options);
		const id = req.params.id;
		Promise.resolve()
			.then(() => options.handlers.single(ctx, req.params.id))
			.then(data => {
				if (!data) {
					throw new CBQError(options.texts.errorNotFound(ctx, id), 404);
				}

				return options.views.editPage(ctx, data, false);
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
