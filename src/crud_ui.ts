import * as libPath from 'path';

import * as express from 'express';
import * as bodyParser from 'body-parser';

import { CUIOptions, ICUIOptionsSource } from './types/options';
import { CUIContext } from './types/context';
import * as handlers from './web/handlers';
import { createCSRFMiddleware } from './web/csrf_middleware';
import { createHandlerResponseWrapper } from './types/responses';
import { createFlashManager } from './web/flash_manager';

/**
 * Create express.js router that will serve a CRUD UI
 */
export function crudUI<T>(optionsSource: ICUIOptionsSource<T>) {
  const options = new CUIOptions(optionsSource);
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

  router.get(options.routes.indexPage, wrap(handlers.indexPage, 'indexPage'));

  if (options.isSingleRecordMode) {
    router.get(
      options.routes.singleRecordModeEditPage,
      wrap(handlers.editPage, 'singleRecordModeEditPage')
    );
    router.post(
      options.routes.singleRecordModeEditAction,
      wrap(handlers.editAction, 'singleRecordModeEditAction')
    );
  } else {
    router.get(options.routes.createPage, wrap(handlers.createPage, 'createPage'));
    router.post(options.routes.createAction, wrap(handlers.createAction, 'createAction'));

    router.get(options.routes.editPage(':id'), wrap(handlers.editPage, 'editPage'));
    router.post(options.routes.editAction(':id'), wrap(handlers.editAction, 'editAction'));

    router.get(options.routes.detailPage(':id'), wrap(handlers.detailPage, 'detailPage'));
    router.get(options.routes.detailEditPage(':id'), wrap(handlers.editPage, 'detailEditPage'));
    router.post(
      options.routes.detailEditAction(':id'),
      wrap(handlers.editAction, 'detailEditAction')
    );

    router.post(options.routes.deleteAction(':id'), wrap(handlers.deleteAction, 'deleteAction'));
  }

  router.use((err, req, res, next) => {
    const ctx = new CUIContext(options, req, req.routeName);

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
