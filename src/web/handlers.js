const { CBQ_FIELD_TYPES } = require('../types/consts');
const { CBQContext } = require('../types/context');
const { CBQError, CBQActionNotSupportedError, CBQValidationError } = require('../types/errors');
const { CBQRedirectResponse } = require('../types/responses');
const { capitalize } = require('../tools');

// *********************************************************************************************************************

/**
 * @param {CBQField[]} fields
 * @param {Object} body
 */
function coerceAndValidateEditPayload(fields, body) {
	const payload = {};
	const validationErrors = [];
	for (const field of fields) {
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

		// TODO
		if (!value) {
			validationErrors.push({
				field,
				value,
				message: 'must not be empty',
				toString() {
					return capitalize(this.field.label) + ' ' + this.message;
				},
			});
		}

		payload[field.name] = value;
	}

	if (validationErrors.length) {
		// Validation failed
		throw new CBQValidationError(validationErrors);
	}

	return payload;
}

/**
 * Try to convert a result from user's method into a flash message object. Returns null if unable.
 * @param {CBQContext} ctx
 * @param makeMessage
 * @param result
 */
function resultToFlash(ctx, makeMessage, result) {
	if (!result || result === true) {
		return null;
	}

	const message = typeof result === 'string' ? result : makeMessage(ctx, result);
	return { message };
}

// *********************************************************************************************************************

/**
 * @param {CBQContext} ctx
 */
function indexPage(ctx) {
	return Promise.resolve()
		.then(() => ctx.options.actions.getList(ctx))
		.then(data => {
			if (!data) {
				throw new CBQError(`Invalid data`);
			}

			return ctx.options.views.listPage(ctx, data);
		});
}

/**
 * @param {CBQContext} ctx
 */
function createPage(ctx) {
	return ctx.options.views.editPage(ctx, null);
}

/**
 * @param {CBQContext} ctx
 */
function createAction(ctx) {
	CBQActionNotSupportedError.assert(ctx.options.actions, 'create');

	return Promise.resolve()
		.then(() => {
			const payload = coerceAndValidateEditPayload(ctx.options.fields, ctx.body);
			return ctx.options.actions.create(ctx, payload);
		})
		.then(
			createResult => {
				return new CBQRedirectResponse(
					ctx.url(ctx.options.urls.indexPage),
					resultToFlash(ctx, ctx.options.texts.flashMessageRecordCreated, createResult)
				);
			},
			error => {
				if (error instanceof CBQValidationError) {
					// Show errors on page
					return new CBQRedirectResponse(ctx.url(ctx.options.urls.createPage), {
						error,
					});
				}

				// Pass through other errors
				throw error;
			}
		);
}

/**
 * @param {CBQContext} ctx
 */
function editPage(ctx) {
	return Promise.resolve()
		.then(() => ctx.options.actions.getSingle(ctx, ctx.idParam))
		.then(data => {
			if (!data) {
				throw new CBQError(ctx.options.texts.errorNotFound(ctx, ctx.idParam), 404);
			}

			return ctx.options.views.editPage(ctx, data);
		});
}

/**
 * @param {CBQContext} ctx
 */
function editAction(ctx) {
	CBQActionNotSupportedError.assert(ctx.options.actions, 'update');

	return Promise.resolve()
		.then(() => {
			const payload = coerceAndValidateEditPayload(ctx.options.fields, ctx.body);
			return ctx.options.actions.update(ctx, ctx.idParam, payload);
		})
		.then(
			updateResult => {
				return new CBQRedirectResponse(
					ctx.url(ctx.options.urls.indexPage),
					resultToFlash(ctx, ctx.options.texts.flashMessageRecordUpdated, updateResult)
				);
			},
			error => {
				if (error instanceof CBQValidationError) {
					// Show errors on page
					return new CBQRedirectResponse(ctx.url(ctx.options.urls.editPage(ctx.idParam)), {
						error,
					});
				}

				// Pass through other errors
				throw error;
			}
		);
}

/**
 * @param {CBQContext} ctx
 */
function deleteAction(ctx) {
	CBQActionNotSupportedError.assert(ctx.options.actions, 'delete');

	return Promise.resolve()
		.then(() => ctx.options.actions.delete(ctx, ctx.idParam))
		.then(deleteResult => {
			return new CBQRedirectResponse(
				ctx.url(ctx.options.urls.indexPage),
				resultToFlash(ctx, ctx.options.texts.flashMessageRecordDeleted, deleteResult)
			);
		});
}

// *********************************************************************************************************************

module.exports = {
	indexPage,

	createPage,
	createAction,

	editPage,
	editAction,

	deleteAction,
};
