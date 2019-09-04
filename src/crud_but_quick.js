const libPath = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const { CBQ_FIELD_TYPES } = require('./consts');
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

	router.use(bodyParser.urlencoded());

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

				return options.views.editPage(ctx, data);
			})
			.then(html => {
				res.header('Content-Type', 'text/html').send(html);
			}, next);
	});

	router.post('/edit/:id', (req, res, next) => {
		const ctx = new CBQContext(options);
		const id = req.params.id;

		return Promise.resolve()
			.then(() => {
				const payload = {};
				for (const field of options.fields) {
					if (field.noEdit) {
						continue;
					}

					let value = req.body[field.name];

					if (field.type === CBQ_FIELD_TYPES.select) {
						if (field.nullOption && !value) {
							// Convert empty string value to null
							value = null;
						}
						if (value !== null && !field.values.includes(value)) {
							// Invalid value, user trying to be sneaky?
							throw new CBQError(`Invalid ${field.name} value: "${value}".`);
						}
					}

					// TODO: Do some real validation here

					payload[field.name] = value;
				}
				
				return options.handlers.update(ctx, id, payload);
			})
			.then(() => {
				return res.redirect('/edit/' + id);
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
