'use strict';

const libPath = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const { CUIOptions } = require('./types/options');
const { CUIContext } = require('./types/context');
const { createHandlerResponseWrapper } = require('./types/responses');
const { ROUTE_NAMES } = require('./types/routes');
const { createFlashManager } = require('./web/flash_manager');
const { createCSRFMiddleware } = require('./web/csrf_middleware');
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

	if (options.tweaks.csrfEnabled) {
		router.use(
			createCSRFMiddleware(
				options.tweaks.csrfFieldName,
				options.tweaks.csrfCookieName,
				options.debugLog
			)
		);
	}

	router.get(options.routes.indexPage, wrap(handlers.indexPage, ROUTE_NAMES.indexPage));

	if (options.isSingleRecordMode) {
		router.get(
			options.routes.singleRecordModeEditPage,
			wrap(handlers.editPage, ROUTE_NAMES.singleRecordModeEditPage)
		);
		router.post(
			options.routes.singleRecordModeEditAction,
			wrap(handlers.editAction, ROUTE_NAMES.singleRecordModeEditAction)
		);
	} else {
		router.get(options.routes.createPage, wrap(handlers.createPage, ROUTE_NAMES.createPage));
		router.post(options.routes.createAction, wrap(handlers.createAction, ROUTE_NAMES.createAction));

		router.get(options.routes.editPage(':id'), wrap(handlers.editPage, ROUTE_NAMES.editPage));
		router.post(
			options.routes.editAction(':id'),
			wrap(handlers.editAction, ROUTE_NAMES.editAction)
		);

		router.get(options.routes.detailPage(':id'), wrap(handlers.detailPage, ROUTE_NAMES.detailPage));
		router.get(
			options.routes.detailEditPage(':id'),
			wrap(handlers.editPage, ROUTE_NAMES.detailEditPage)
		);
		router.post(
			options.routes.detailEditAction(':id'),
			wrap(handlers.editAction, ROUTE_NAMES.detailEditAction)
		);

		router.post(
			options.routes.deleteAction(':id'),
			wrap(handlers.deleteAction, ROUTE_NAMES.deleteAction)
		);
	}

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
