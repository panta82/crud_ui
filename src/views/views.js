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

const {
	editPage,
	editHeader,
	editAbove,
	editBelow,
	editFooter,
	editContent,
} = require('./edit_views');

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

		this.editPage = editPage;
		this.editHeader = editHeader;
		this.editAbove = editAbove;
		this.editBelow = editBelow;
		this.editFooter = editFooter;
		this.editContent = editContent;

		Object.assign(this, source);
	}
}

// *********************************************************************************************************************

module.exports = new CBQViews();
module.exports.CBQViews = CBQViews;
