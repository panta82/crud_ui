import * as vjs from 'validate.js';

import {
	CUIActionNotSupportedError,
	CUIError,
	CUIValidationError,
	CUIValidationFault,
} from '../types/errors';
import { CUIRedirectResponse } from '../types/responses';
import { CUIContext } from '../types/context';
import { CUIField } from '../types/fields';
import { getOrCall } from '../tools';

// *********************************************************************************************************************

function coerceAndValidateEditPayload<T>(ctx: CUIContext<T>, isCreate: boolean) {
	const payload = {};
	const faults = [];

	for (const field of ctx.fields) {
		if (
			!field.allowEdit ||
			(isCreate && !field.allowEditNew) ||
			(!isCreate && !field.allowEditExisting)
		) {
			// We don't want to edit this field
			continue;
		}

		let value = ctx.body[field.name];

		if (field.type === 'select') {
			if (field.nullOption && !value) {
				// Convert empty string value to null
				value = null;
			}
			if (value !== null && field.values) {
				const values = getOrCall(field.values, ctx);
				if (!values.some(f => f === value || (f && f.value === value))) {
					// Invalid value, user trying to be sneaky?
					throw new CUIError(`Invalid ${field.name} value: "${value}".`);
				}
			}
		}

		if (field.type === 'boolean') {
			// Cast to boolean
			value = !!value;
		}

		doValidate(field, 'validate', value);
		if (isCreate) {
			doValidate(field, 'validateCreate', value);
		} else {
			doValidate(field, 'validateEdit', value);
		}

		payload[field.name] = value;
	}

	if (faults.length) {
		// Validation failed
		throw new CUIValidationError(faults, payload);
	}

	return payload;

	function doValidate<T extends keyof CUIField>(field: CUIField, prop: T, value) {
		const validate = field[prop];
		if (!validate) {
			return;
		}

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
 */
function resultToFlash<T extends any>(
	ctx: CUIContext,
	makeMessage: (ctx: CUIContext, T) => string,
	result: T
) {
	if (!result || result === true) {
		return null;
	}

	const message = typeof result === 'string' ? result : makeMessage(ctx, result);
	return { message };
}

// *********************************************************************************************************************

export function indexPage(ctx: CUIContext) {
	return Promise.resolve()
		.then(() => {
			if (ctx.options.isSingleRecordMode) {
				return ctx.actions.getSingle(ctx, null);
			}
			return ctx.actions.getList(ctx);
		})
		.then(data => {
			if (!data) {
				throw new CUIError(`Invalid data`);
			}

			return ctx.options.isSingleRecordMode
				? ctx.views.detailPage(ctx, data)
				: ctx.views.listPage(ctx, data);
		});
}

export function createPage(ctx: CUIContext) {
	return ctx.views.editPage(ctx, null);
}

export function createAction(ctx: CUIContext) {
	CUIActionNotSupportedError.assert(ctx.actions, 'create');

	return Promise.resolve()
		.then(() => {
			const payload = coerceAndValidateEditPayload(ctx, true);
			return ctx.actions.create(ctx, payload);
		})
		.then(
			createResult => {
				return new CUIRedirectResponse(
					ctx.url(ctx.routes.indexPage),
					resultToFlash(ctx, ctx.texts.flashMessageRecordCreated, createResult)
				);
			},
			error => {
				if (error instanceof CUIValidationError) {
					// Show errors on page
					return new CUIRedirectResponse(ctx.url(ctx.routes.createPage), {
						error,
					});
				}

				// Pass through other errors
				throw error;
			}
		);
}

export function editPage(ctx: CUIContext) {
	return Promise.resolve()
		.then(() => ctx.actions.getSingle(ctx, ctx.idParam))
		.then(data => {
			if (!data) {
				throw new CUIError(ctx.texts.errorNotFound(ctx, ctx.idParam), 404);
			}

			return ctx.views.editPage(ctx, data);
		});
}

export function editAction(ctx: CUIContext) {
	CUIActionNotSupportedError.assert(ctx.actions, 'update');

	return Promise.resolve()
		.then(() => {
			const payload = coerceAndValidateEditPayload(ctx, false);
			return ctx.options.isSingleRecordMode
				? ctx.actions.update(ctx, payload)
				: ctx.actions.update(ctx, ctx.idParam, payload);
		})
		.then(
			updateResult => {
				const redirectUrl =
					ctx.routeName === 'detailEditAction'
						? ctx.routes.detailPage(ctx.idParam)
						: ctx.routes.indexPage; // This works for single record mode too

				return new CUIRedirectResponse(
					ctx.url(redirectUrl),
					resultToFlash(ctx, ctx.texts.flashMessageRecordUpdated, updateResult)
				);
			},
			error => {
				if (error instanceof CUIValidationError) {
					// Show errors on page
					const redirectUrl = ctx.options.isSingleRecordMode
						? ctx.routes.singleRecordModeEditPage
						: ctx.routeName === 'detailEditAction'
						? ctx.routes.detailEditPage(ctx.idParam)
						: ctx.routes.editPage(ctx.idParam);
					return new CUIRedirectResponse(ctx.url(redirectUrl), {
						error,
					});
				}

				// Pass through other errors
				throw error;
			}
		);
}

export function detailPage(ctx: CUIContext) {
	return Promise.resolve()
		.then(() => ctx.actions.getSingle(ctx, ctx.idParam))
		.then(data => {
			if (!data) {
				throw new CUIError(ctx.texts.errorNotFound(ctx, ctx.idParam), 404);
			}

			return ctx.views.detailPage(ctx, data);
		});
}

export function deleteAction(ctx: CUIContext) {
	CUIActionNotSupportedError.assert(ctx.actions, 'delete');

	return Promise.resolve()
		.then(() => ctx.actions.delete(ctx, ctx.idParam))
		.then(deleteResult => {
			return new CUIRedirectResponse(
				ctx.url(ctx.routes.indexPage),
				resultToFlash(ctx, ctx.texts.flashMessageRecordDeleted, deleteResult)
			);
		});
}
