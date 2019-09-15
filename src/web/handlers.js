const vjs = require('validate.js');

const { CUI_FIELD_TYPES } = require('../types/consts');
const { CUIContext } = require('../types/context');
const {
	CUIError,
	CUIActionNotSupportedError,
	CUIValidationError,
	CUIValidationFault,
} = require('../types/errors');
const { CUIRedirectResponse } = require('../types/responses');
const { capitalize } = require('../tools');

// *********************************************************************************************************************

/**
 * @param {CUIContext} ctx
 * @param {boolean} isCreate
 */
function coerceAndValidateEditPayload(ctx, isCreate) {
	const payload = {};
	const faults = [];

	for (const field of ctx.fields) {
		if (field.noEdit) {
			continue;
		}

		let value = ctx.body[field.name];

		if (field.type === CUI_FIELD_TYPES.select) {
			if (field.nullOption && !value) {
				// Convert empty string value to null
				value = null;
			}
			if (value !== null && !field.values.includes(value)) {
				// Invalid value, user trying to be sneaky?
				throw new CUIError(`Invalid ${field.name} value: "${value}".`);
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
		throw new CUIValidationError(faults, payload);
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
					new CUIValidationFault({
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
 * @param {CUIContext} ctx
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
 * @param {CUIContext} ctx
 */
function indexPage(ctx) {
	return Promise.resolve()
		.then(() => ctx.actions.getList(ctx))
		.then(data => {
			if (!data) {
				throw new CUIError(`Invalid data`);
			}

			return ctx.views.listPage(ctx, data);
		});
}

/**
 * @param {CUIContext} ctx
 */
function createPage(ctx) {
	return ctx.views.editPage(ctx, null);
}

/**
 * @param {CUIContext} ctx
 */
function createAction(ctx) {
	CUIActionNotSupportedError.assert(ctx.actions, 'create');

	return Promise.resolve()
		.then(() => {
			const payload = coerceAndValidateEditPayload(ctx, true);
			return ctx.actions.create(ctx, payload);
		})
		.then(
			createResult => {
				return new CUIRedirectResponse(
					ctx.url(ctx.urls.indexPage),
					resultToFlash(ctx, ctx.texts.flashMessageRecordCreated, createResult)
				);
			},
			error => {
				if (error instanceof CUIValidationError) {
					// Show errors on page
					return new CUIRedirectResponse(ctx.url(ctx.urls.createPage), {
						error,
					});
				}

				// Pass through other errors
				throw error;
			}
		);
}

/**
 * @param {CUIContext} ctx
 */
function editPage(ctx) {
	return Promise.resolve()
		.then(() => ctx.actions.getSingle(ctx, ctx.idParam))
		.then(data => {
			if (!data) {
				throw new CUIError(ctx.texts.errorNotFound(ctx, ctx.idParam), 404);
			}

			return ctx.views.editPage(ctx, data);
		});
}

/**
 * @param {CUIContext} ctx
 */
function editAction(ctx) {
	CUIActionNotSupportedError.assert(ctx.actions, 'update');

	return Promise.resolve()
		.then(() => {
			const payload = coerceAndValidateEditPayload(ctx, false);
			return ctx.actions.update(ctx, ctx.idParam, payload);
		})
		.then(
			updateResult => {
				return new CUIRedirectResponse(
					ctx.url(ctx.urls.indexPage),
					resultToFlash(ctx, ctx.texts.flashMessageRecordUpdated, updateResult)
				);
			},
			error => {
				if (error instanceof CUIValidationError) {
					// Show errors on page
					return new CUIRedirectResponse(ctx.url(ctx.urls.editPage(ctx.idParam)), {
						error,
					});
				}

				// Pass through other errors
				throw error;
			}
		);
}

/**
 * @param {CUIContext} ctx
 */
function deleteAction(ctx) {
	CUIActionNotSupportedError.assert(ctx.actions, 'delete');

	return Promise.resolve()
		.then(() => ctx.actions.delete(ctx, ctx.idParam))
		.then(deleteResult => {
			return new CUIRedirectResponse(
				ctx.url(ctx.urls.indexPage),
				resultToFlash(ctx, ctx.texts.flashMessageRecordDeleted, deleteResult)
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
