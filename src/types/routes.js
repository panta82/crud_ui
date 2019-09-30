'use strict';

/**
 * Define URL-s to use for various pages
 */
class CUIRoutes {
	constructor(/** CUIRoutes */ source) {
		this.indexPage = '/';

		this.createPage = '/create';
		this.createAction = '/create';

		this.editPage = id => '/edit/' + encodeURI(id);
		this.editAction = id => '/edit/' + encodeURI(id);

		this.detailPage = id => '/detail/' + encodeURI(id);
		this.detailEditPage = id => '/detail/' + encodeURI(id) + '/edit';
		this.detailEditAction = id => '/detail/' + encodeURI(id) + '/edit';

		this.deleteAction = id => '/delete/' + encodeURI(id);

		Object.assign(this, source);
	}
}

module.exports = new CUIRoutes();

/** @type {CUIRoutes} */
module.exports.ROUTE_NAMES = Object.keys(module.exports).reduce((lookup, key) => {
	lookup[key] = key;
	return lookup;
}, {});

module.exports.CUIRoutes = CUIRoutes;
