const vjs = require('validate.js');

const { CBQ_FIELD_TYPES } = require('../types/consts');
const { CBQContext } = require('../types/context');
const {
	CBQError,
	CBQActionNotSupportedError,
	CBQValidationError,
	CBQValidationFault,
} = require('../types/errors');
const { CBQRedirectResponse } = require('../types/responses');
const { capitalize } = require('../tools');

// *********************************************************************************************************************

/**
 * @param {CBQContext} ctx
 * @param {boolean} isCreate
 */
function coerceAndValidateEditPayload(ctx, isCreate) {
	const payload = {};
	const faults = [];

	for (const field of ctx.options.fields) {
		if (field.noEdit) {
			continue;
		}

		let value = ctx.body[field.name];

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

		doValidate(field, 'validate');
		if (isCreate) {
			doValidate(field, 'validateCreate');
		} else {
			doValidate(field, 'validateEdit');
		}

		payload[field.name] = value;
	}

	if (faults.length) {
		// Validation failed
		throw new CBQValidationError(faults, payload);
	}

	return payload;

	function doValidate(field, prop) {
		const validate = field[prop];
		if (!validate) {
			return;
		}

		const value = ctx.body[field.name];

		let errors;

		if (typeof validate === 'function') {
			// User-supplied validate function
			errors = validate.call(field, ctx, value, ctx.body);
			if (errors && typeof errors === 'string') {
				// Allow user to just return a single error string
				errors = [errors];
			}
		} else {
			// Otherwise, use validate library
			errors = vjs.single(value, validate, {
				fullMessages: false,
			});
		}

		if (Array.isArray(errors)) {
			// Some faults found
			for (const message of errors) {
				faults.push(
					new CBQValidationFault({
						message,
						field,
						value,
					})
				);
			}
		}
	}
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
			const payload = coerceAndValidateEditPayload(ctx, true);
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
			const payload = coerceAndValidateEditPayload(ctx, false);
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
