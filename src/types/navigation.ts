import { makeObjectAsserters, PartialExcept, safeAssign } from '../tools';
import { ICUIIconName } from './icons';
import { CUIContext } from './context';

export class CUINavigationItem {
	/**
	 * What will be written on the menu item
	 */
	public title: string = undefined;
	/**
	 * Icon name to use for this menu item.
	 */
	public icon: ICUIIconName = undefined;

	/**
	 * If provided, item will be rendered as a link leading to given (relative or absolute) URL.
	 */
	public url: string = undefined;

	/**
	 * If provided, item will be rendered as a drop-down menu, with given sub-items
	 */
	public items: CUINavigationItem[] = undefined;

	/**
	 * If provided, this will be called to produce custom HTML instead of default rendering.
	 * Useful if you want custom functionality for a menu item (call a javascript, for example).
	 */
	public render: (
		ctx: CUIContext,
		item: CUINavigationItem,
		index: number,
		isRight: boolean,
		parentItem: CUINavigationItem,
		parentIndex: number
	) => {} = undefined;

	constructor(source?: Partial<CUINavigationItem>) {
		safeAssign(this, source);
	}

	_validateAndCoerce(): CUINavigationItem {
		const asserters = makeObjectAsserters(this, 'Navigation item field "');

		asserters.type('title', 'string');
		asserters.type('icon', 'string');
		asserters.type('url', 'string');
		asserters.type('items', 'array');
		asserters.type('render', 'function');

		if (!this.title && !this.render) {
			throw new TypeError(
				`Navigation item must be provided through either a title or a render function`
			);
		}

		return this;
	}

	static cast(item: any): CUINavigationItem {
		if (!(item instanceof CUINavigationItem)) {
			item = new CUINavigationItem(item);
		}
		return item;
	}
}

export type ICUINavigationSource = PartialExcept<CUINavigation, 'brand'>;
export class CUINavigation {
	/**
	 * Main application brand link, displayed in the left corner of navbar.
	 * Required.
	 */
	public brand: CUINavigationItem = undefined;

	/**
	 * Menu items that will stick to the left side of menu
	 */
	public left: CUINavigationItem[] = undefined;

	/**
	 * Menu items that will hang in the right corner. This is usually a drop down menu or similar.
	 */
	public right: CUINavigationItem[] = undefined;

	constructor(source?: Partial<CUINavigation>) {
		safeAssign(this, source);
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
