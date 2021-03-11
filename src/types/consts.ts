import { enumize } from '../tools';

/**
 * Available field types
 */
export const CUI_FIELD_TYPES = enumize([
	/**
	 * Ordinary single-line string
	 */
	'string',

	/**
	 * Password or hidden string
	 */
	'secret',

	/**
	 * Multiline text
	 */
	'text',

	/**
	 * List with multiple options to chose from (shown as combo-box)
	 */
	'select',

	/**
	 * Yes/no, true/false. A checkbox.
	 */
	'boolean',
] as const);
export type ICUIFieldType = keyof typeof CUI_FIELD_TYPES;

/**
 * Mode in which to run he router
 */
export const CUI_MODES = enumize([
	/**
	 * Displays a table view with links to detail view. Edit page can be accessed from either. Loads multiple records. Allows deletion.
	 */
	'detail_list',

	/**
	 * Displays a table view without links to detail view. Edit page is accessed directly from table. Loads multiple records. Allows deletion.
	 */
	'simple_list',

	/**
	 * Displays a detail view with only a single record (no id is used). No deletion. No table view.
	 */
	'single_record',
] as const);
export type ICUIMode = keyof typeof CUI_MODES;
