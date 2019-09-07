const libPath = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const { CBQOptions } = require('./types/options');
const { CBQContext } = require('./types/context');
const { createHandlerResponseWrapper } = require('./types/responses');
const { createFlashManager } = require('./web/flash_manager');
const handlers = require('./web/handlers');

/**
 * Create express.js router that will serve a CRUD ui
 * @param {CBQOptions} options
 */
function crudButQuick(options) {
	options = new CBQOptions(options);

	options.validateAndCoerce();

	const flashManager = createFlashManager();
	const wrap = createHandlerResponseWrapper(options, flashManager);

	const router = express.Router();

	router.use(express.static(libPath.resolve(__dirname, '../static')));
	router.use(bodyParser.urlencoded());
	router.use(flashManager.middleware);

	router.get('/', wrap(handlers.indexPage));

	router.get('/create', wrap(handlers.createPage));
	router.post('/create', wrap(handlers.createAction));

	router.get('/edit/:id', wrap(handlers.editPage));
	router.post('/edit/:id', wrap(handlers.editAction));

	router.post('/delete/:id', wrap(handlers.deleteAction));

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
