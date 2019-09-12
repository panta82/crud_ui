const { makeObjectAsserters } = require('../tools');

class CUINavigationItem {
	constructor(/** CUINavigation */ source) {
		/**
		 * What will be written on the menu item
		 * @type {string}
		 */
		this.title = undefined;

		/**
		 * If provided, item will be rendered as a link leading to given (relative or absolute )URL.
		 * @type {string}
		 */
		this.url = undefined;

		/**
		 * If provided, item will be rendered as a drop-down menu, with given sub-items
		 * @type {CUINavigationItem[]}
		 */
		this.items = undefined;

		/**
		 * If provided, this will be called to produce custom HTML instead of default rendering.
		 * Useful if you want custom functionality for a menu item (call a javascript, for example).
		 * @type {function(CUIContext, CUINavigationItem, number, boolean)}
		 */
		this.render = undefined;

		Object.assign(this, source);
	}

	_validateAndCoerce() {
		const asserters = makeObjectAsserters(this, 'Navigation item field "');

		asserters.type('title', 'string');
		asserters.type('url', 'string');
		asserters.type('items', 'array');
		asserters.type('render', 'function');

		if (!this.title && !this.render) {
			throw new TypeError(`Navigation item must be provided either a title or a render function`);
		}

		return this;
	}

	static cast(item) {
		if (!(item instanceof CUINavigationItem)) {
			item = new CUINavigationItem(item);
		}
		return item;
	}
}

class CUINavigation {
	constructor(/** CUINavigation */ source) {
		/**
		 * Main application brand link, displayed in the left corner of navbar.
		 * Required.
		 * @type {CUINavigationItem}
		 */
		this.brand = undefined;

		/**
		 * Menu items that will stick to the left side of menu
		 * @type {CUINavigationItem[]}
		 */
		this.left = undefined;

		/**
		 * Menu items that will hang in the right corner. This is usually a drop down menu or similar.
		 * @type {CUINavigationItem[]}
		 */
		this.right = undefined;

		Object.assign(this, source);
	}

	_validateAndCoerce() {
		const asserters = makeObjectAsserters(this, 'Navigation property "');

		asserters.provided('brand');
		asserters.type('brand', 'object');

		asserters.type('left', 'array');
		asserters.type('right', 'array');

		this.brand = CUINavigationItem.cast(this.brand)._validateAndCoerce();

		['left', 'right'].forEach(side => {
			if (this[side]) {
				this[side] = this[side].map((item, index) => {
					try {
						return CUINavigationItem.cast(item)._validateAndCoerce();
					} catch (err) {
						throw new TypeError(
							`Invalid item ${index} on the ${side} side of navbar: ${err.message}`
						);
					}
				});
			}
		});
	}
}

module.exports = { CUINavigation, CUINavigationItem };
