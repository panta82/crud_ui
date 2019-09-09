/**
 * Define URL-s to use for various pages
 */
class CBQUrls {
	constructor(/** CBQUrls */ source) {
		this.indexPage = '/';

		this.createPage = '/create';
		this.createAction = '/create';

		this.editPage = id => '/edit/' + encodeURI(id);
		this.editAction = id => '/edit/' + encodeURI(id);

		this.deleteAction = id => '/delete/' + encodeURI(id);

		Object.assign(this, source);
	}
}

module.exports = new CBQUrls();
module.exports.CBQUrls = CBQUrls;
