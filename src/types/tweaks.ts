import { makeObjectAsserters, safeAssign } from '../tools';
import { CUIContext } from './context';

/**
 * Create a function that produces name if development and name.min.ext in production.
 */
export function minimizeInProduction(name: string): (ctx: CUIContext) => string {
	const dotIndex = name.lastIndexOf('.');
	const cleanName = name.substring(0, dotIndex);
	const extension = name.slice(dotIndex);
	return ctx => {
		return ctx.options.isProduction ? cleanName + '.min' + extension : name;
	};
}

/**
 * Options which the default views will utilize to customize UI appearance.
 * Allow user to modify aspects of UI without going "nuclear option" and rewriting views themselves.
 */
export class CUITweaks {
	/**
	 * If enabled, renders a red box with validation error message and all the faults above the edit form.
	 * Otherwise, we will still show errors next to affected fields, but not above the form.
	 * This will have no influence on non-validation errors.
	 */
	public showValidationErrorSummary = true;

	/**
	 * List of global CSS files to load in every page and order in which to do it.
	 * Can take strings (paths) or functions which produce strings.
	 */
	public globalCSS: Array<string | ((ctx: CUIContext) => string)> = [
		minimizeInProduction('/css/bootstrap.css'),
		minimizeInProduction('/css/fontawesome.css'),
		'/css/styles.css',
	];

	/**
	 * List of global javascript files to load in every page and order in which to do it.
	 * Can take strings (paths) or functions which produce strings.
	 */
	public globalJS: Array<string | ((ctx: CUIContext) => string)> = [
		minimizeInProduction('/js/jquery-3.4.1.slim.js'),
		minimizeInProduction('/js/bootstrap.js'),
		'/js/scripts.js',
	];

	/**
	 * Enable CSRF protection in forms
	 */
	public csrfEnabled = true;

	/**
	 * Name of the form field to store the CSRF token in
	 */
	public csrfFieldName = '__cui_csrf__';

	/**
	 * Name of the cookie to use for storing CSRF. Note that this will be common for all CUI routers!
	 */
	public csrfCookieName = 'CUI_csrf';

	/**
	 * Name of the cookie to use for storing flash messages.
	 */
	public flashCookieName = 'CUI_flash';

	/**
	 * How many milliseconds can a flash live before it is consumed
	 */
	public flashMaxAge = 1000 * 60;

	constructor(source?: Partial<CUITweaks>) {
		safeAssign(this, source);
	}

	_validateAndCoerce() {
		const asserters = makeObjectAsserters(this, 'tweak "', '"');

		asserters.type('showValidationErrorSummary', 'boolean');

		for (const key of ['globalCSS', 'globalJS']) {
			asserters.type(key as any, 'array');
			this[key] = this[key].map(item => {
				if (typeof item === 'function') {
					return item;
				}
				return () => item;
			});
		}

		asserters.provided('csrfEnabled');
		asserters.type('csrfEnabled', 'boolean');

		asserters.provided('csrfFieldName');
		asserters.type('csrfFieldName', 'string');

		asserters.provided('flashCookieName');
		asserters.type('flashCookieName', 'string');

		asserters.provided('flashMaxAge');
		asserters.type('flashMaxAge', 'number');
	}
}
