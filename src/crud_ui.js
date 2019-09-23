'use strict';

const libPath = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const { CUIOptions } = require('./types/options');
const { CUIContext } = require('./types/context');
const { createHandlerResponseWrapper } = require('./types/responses');
const { createFlashManager } = require('./web/flash_manager');
const { createCSRFMiddleware } = require('./web/csrf_middleware');
const { createSessionMiddleware } = require('./web/session_middleware');
const handlers = require('./web/handlers');

/**
 * Create express.js router that will serve a CRUD UI
 * @param {CUIOptions} options
 */
function crudUI(options) {
	options = new CUIOptions(options);

	options._validateAndCoerce();

	const flashManager = createFlashManager(
		options.tweaks.flashCookieName,
		options.tweaks.flashMaxAge,
		options.debugLog
	);
	const wrap = createHandlerResponseWrapper(options, flashManager);

	const router = express.Router();

	router.use(express.static(libPath.resolve(__dirname, '../static')));
	router.use(
		bodyParser.urlencoded({
			extended: true,
		})
	);

	router.use(flashManager.middleware);

	router.use(
		createSessionMiddleware(
			options.tweaks.sessionCookieName,
			options.tweaks.sessionTTL,
			options.debugLog
		)
	);

	if (options.tweaks.csrfEnabled) {
		router.use(createCSRFMiddleware(options.tweaks.csrfFieldName, options.debugLog));
	}

	router.get(options.urls.indexPage, wrap(handlers.indexPage));

	router.get(options.urls.createPage, wrap(handlers.createPage));
	router.post(options.urls.createAction, wrap(handlers.createAction));

	router.get(options.urls.editPage(':id'), wrap(handlers.editPage));
	router.post(options.urls.editAction(':id'), wrap(handlers.editAction));

	router.get(options.urls.detailPage(':id'), wrap(handlers.detailPage));

	router.post(options.urls.deleteAction(':id'), wrap(handlers.deleteAction));

	router.use((err, req, res, next) => {
		const ctx = new CUIContext(options, req);

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
	crudUI,
};
