const libPath = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const { CBQ_FIELD_TYPES } = require('./types/consts');
const { CBQOptions } = require('./types/options');
const { CBQError, CBQOperationNotSupportedError } = require('./types/errors');
const { CBQContext } = require('./types/context');
const { createFlashManager } = require('./web/flash_manager');

/**
 * Create express.js router that will serve a CRUD ui
 * @param {CBQOptions} options
 */
function crudButQuick(options) {
	options = new CBQOptions(options);

	options.validateAndCoerce();

	const flashManager = createFlashManager();

	const router = express.Router();

	router.use(express.static(libPath.resolve(__dirname, '../static')));
	router.use(bodyParser.urlencoded());
	router.use(flashManager.middleware);

	router.get('/', (req, res, next) => {
		const ctx = new CBQContext(options, req);

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

	router.get('/create', (req, res, next) => {
		const ctx = new CBQContext(options, req);
		Promise.resolve()
			.then(() => {
				return options.views.editPage(ctx, null);
			})
			.then(html => {
				res.header('Content-Type', 'text/html').send(html);
			}, next);
	});

	/**
	 * @param {Object} body
	 */
	function coerceAndValidateEditPayload(body) {
		const payload = {};
		for (const field of options.fields) {
			if (field.noEdit) {
				continue;
			}

			let value = body[field.name];

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
		return payload;
	}

	router.post('/create', (req, res, next) => {
		const ctx = new CBQContext(options, req);

		return Promise.resolve()
			.then(() => {
				CBQOperationNotSupportedError.assert(options.handlers, 'create');
				const payload = coerceAndValidateEditPayload(req.body);
				return options.handlers.create(ctx, payload);
			})
			.then(createResult => {
				if (createResult && createResult !== true) {
					const message =
						typeof createResult === 'string'
							? createResult
							: options.texts.flashMessageRecordCreated(ctx, createResult);
					flashManager.setFlash(res, {
						message,
					});
				}

				return res.redirect(ctx.url('/'));
			}, next);
	});

	router.get('/edit/:id', (req, res, next) => {
		const ctx = new CBQContext(options, req);
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
		const ctx = new CBQContext(options, req);
		const id = req.params.id;

		return Promise.resolve()
			.then(() => {
				CBQOperationNotSupportedError.assert(options.handlers, 'update');
				const payload = coerceAndValidateEditPayload(req.body);
				return options.handlers.update(ctx, id, payload);
			})
			.then(updateResult => {
				if (updateResult && updateResult !== true) {
					const message =
						typeof updateResult === 'string'
							? updateResult
							: options.texts.flashMessageRecordUpdated(ctx, updateResult);
					flashManager.setFlash(res, {
						message,
					});
				}
				return res.redirect(ctx.url('/'));
			}, next);
	});

	router.post('/delete/:id', (req, res, next) => {
		const ctx = new CBQContext(options, req);
		const id = req.params.id;

		return Promise.resolve()
			.then(() => {
				CBQOperationNotSupportedError.assert(options.handlers, 'delete');
				return options.handlers.delete(ctx, id);
			})
			.then(deleteResult => {
				if (deleteResult && deleteResult !== true) {
					const message =
						typeof deleteResult === 'string'
							? deleteResult
							: options.texts.flashMessageRecordDeleted(ctx, deleteResult);
					flashManager.setFlash(res, {
						message,
					});
				}
				return res.redirect(ctx.url('/'));
			}, next);
	});

	router.use((err, req, res, next) => {
		const ctx = new CBQContext(options, req);

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
