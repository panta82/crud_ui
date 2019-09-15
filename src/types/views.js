'use strict';

// Generated by "generate_views.js", do not edit manually.

class CUIViews {
	constructor(/** CUIViews */ source) {
		// Shared

		this.layout = require('../views/shared_views.js').layout;
		this.header = require('../views/shared_views.js').header;
		this.footer = require('../views/shared_views.js').footer;
		this.navigation = require('../views/shared_views.js').navigation;
		this.navigationItem = require('../views/shared_views.js').navigationItem;
		this.navigationDropDownItem = require('../views/shared_views.js').navigationDropDownItem;
		this.flashMessage = require('../views/shared_views.js').flashMessage;
		this.icon = require('../views/shared_views.js').icon;
		this.csrfField = require('../views/shared_views.js').csrfField;
		this.errorPage = require('../views/shared_views.js').errorPage;

		// List

		this.listPage = require('../views/list_views.js').listPage;
		this.listHeader = require('../views/list_views.js').listHeader;
		this.listAbove = require('../views/list_views.js').listAbove;
		this.listCreateButton = require('../views/list_views.js').listCreateButton;
		this.listBelow = require('../views/list_views.js').listBelow;
		this.listFooter = require('../views/list_views.js').listFooter;
		this.listHead = require('../views/list_views.js').listHead;
		this.listScripts = require('../views/list_views.js').listScripts;
		this.listDeleteModalScripting = require('../views/list_views.js').listDeleteModalScripting;
		this.listContent = require('../views/list_views.js').listContent;
		this.listColumnHeader = require('../views/list_views.js').listColumnHeader;
		this.listRow = require('../views/list_views.js').listRow;
		this.listCell = require('../views/list_views.js').listCell;
		this.listValue = require('../views/list_views.js').listValue;
		this.listControlsCell = require('../views/list_views.js').listControlsCell;
		this.listEditButton = require('../views/list_views.js').listEditButton;
		this.listDeleteButton = require('../views/list_views.js').listDeleteButton;
		this.listDeleteConfirmationModal = require('../views/list_views.js').listDeleteConfirmationModal;
		this.listNoData = require('../views/list_views.js').listNoData;

		// Edit

		this.editPage = require('../views/edit_views.js').editPage;
		this.editHeader = require('../views/edit_views.js').editHeader;
		this.editAbove = require('../views/edit_views.js').editAbove;
		this.editBelow = require('../views/edit_views.js').editBelow;
		this.editFooter = require('../views/edit_views.js').editFooter;
		this.editContent = require('../views/edit_views.js').editContent;
		this.editSaveButton = require('../views/edit_views.js').editSaveButton;
		this.editCancelButton = require('../views/edit_views.js').editCancelButton;
		this.editErrorSummary = require('../views/edit_views.js').editErrorSummary;
		this.editField = require('../views/edit_views.js').editField;
		this.editFieldPrepareHelp = require('../views/edit_views.js').editFieldPrepareHelp;
		this.editFieldPrepareError = require('../views/edit_views.js').editFieldPrepareError;
		this.editFieldPrepareValue = require('../views/edit_views.js').editFieldPrepareValue;
		this.editFieldString = require('../views/edit_views.js').editFieldString;
		this.editFieldText = require('../views/edit_views.js').editFieldText;
		this.editFieldSelect = require('../views/edit_views.js').editFieldSelect;

		Object.assign(this, source);
	}
}

module.exports = new CUIViews();
module.exports.CUIViews = CUIViews;
