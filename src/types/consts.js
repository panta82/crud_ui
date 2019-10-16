'use strict';

/**
 * Available field types
 * @enum
 */
const CUI_FIELD_TYPES = {
	/**
	 * Ordinary single-line string
	 */
	string: 'string',

	/**
	 * Password or hidden string
	 */
	secret: 'secret',

	/**
	 * Multiline text
	 */
	text: 'text',

	/**
	 * List with multiple options to chose from (shown as combo-box)
	 */
	select: 'select',

	/**
	 * Yes/no, true/false. A checkbox.
	 */
	boolean: 'boolean',
};

/**
 * Mode in which to run he router
 * @enum
 */
const CUI_MODES = {
	/**
	 * Displays a table view with links to detail view. Edit page can be accessed from either. Loads multiple records. Allows deletion.
	 */
	detail_list: 'detail_list',

	/**
	 * Displays a table view without links to detail view. Edit page is accessed directly from table. Loads multiple records. Allows deletion.
	 */
	simple_list: 'simple_list',

	/**
	 * Displays a detail view with only a single record (no id is used). No deletion. No table view.
	 */
	single_record: 'single_record',
};

module.exports = {
	CUI_FIELD_TYPES,
	CUI_MODES,
};
