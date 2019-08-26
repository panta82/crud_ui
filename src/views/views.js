const { layout, navigation, header, footer, errorPage } = require('./shared_views');

const {
	listPage,
	listHeader,
	listAbove,
	listBelow,
	listFooter,
	listContent,
	listColumnHeader,
	listRow,
	listCell,
	listControlsCell,
	listEditButton,
	listDeleteButton,
	listNoData,
} = require('./list_views');

class CBQViews {
	constructor(/** CBQViews */ source) {
		this.layout = layout;
		this.navigation = navigation;
		this.header = header;
		this.footer = footer;
		this.errorPage = errorPage;

		this.listPage = listPage;
		this.listHeader = listHeader;
		this.listAbove = listAbove;
		this.listBelow = listBelow;
		this.listFooter = listFooter;
		this.listContent = listContent;
		this.listColumnHeader = listColumnHeader;
		this.listRow = listRow;
		this.listCell = listCell;
		this.listControlsCell = listControlsCell;
		this.listEditButton = listEditButton;
		this.listDeleteButton = listDeleteButton;
		this.listNoData = listNoData;

		Object.assign(this, source);
	}
}

// *********************************************************************************************************************

module.exports = new CBQViews();
module.exports.CBQViews = CBQViews;
