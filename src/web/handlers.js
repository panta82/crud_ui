const { CBQ_FIELD_TYPES } = require('../types/consts');
const { CBQContext } = require('../types/context');
const { CBQError, CBQOperationNotSupportedError } = require('../types/errors');
const { CBQRedirectResponse } = require('../types/responses');

// *********************************************************************************************************************

/**
 * @param {CBQField[]} fields
 * @param {Object} body
 */
function coerceAndValidateEditPayload(fields, body) {
	const payload = {};
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

		// TODO: Do some real validation here

		payload[field.name] = value;
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
		.then(() => ctx.options.handlers.list(ctx))
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
	CBQOperationNotSupportedError.assert(ctx.options.handlers, 'create');

	const payload = coerceAndValidateEditPayload(ctx.options.fields, ctx.body);

	return Promise.resolve()
		.then(() => ctx.options.handlers.create(ctx, payload))
		.then(createResult => {
			return new CBQRedirectResponse(
				ctx.url('/'),
				resultToFlash(ctx, ctx.options.texts.flashMessageRecordCreated, createResult)
			);
		});
}

/**
 * @param {CBQContext} ctx
 */
function editPage(ctx) {
	return Promise.resolve()
		.then(() => ctx.options.handlers.single(ctx, ctx.idParam))
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
	CBQOperationNotSupportedError.assert(ctx.options.handlers, 'update');

	const payload = coerceAndValidateEditPayload(ctx.options.fields, ctx.body);

	return Promise.resolve()
		.then(() => ctx.options.handlers.update(ctx, ctx.idParam, payload))
		.then(updateResult => {
			return new CBQRedirectResponse(
				ctx.url('/'),
				resultToFlash(ctx, ctx.options.texts.flashMessageRecordUpdated, updateResult)
			);
		});
}

/**
 * @param {CBQContext} ctx
 */
function deleteAction(ctx) {
	CBQOperationNotSupportedError.assert(ctx.options.handlers, 'delete');

	return Promise.resolve()
		.then(() => ctx.options.handlers.delete(ctx, ctx.idParam))
		.then(deleteResult => {
			return new CBQRedirectResponse(
				ctx.url('/'),
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
