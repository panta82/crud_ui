'use strict';

const { crudUI } = require('./src/crud_ui');
module.exports = crudUI;
module.exports.crudUI = crudUI;

const { CUI_FIELD_TYPES } = require('./src/types/consts');
module.exports.FIELD_TYPES = CUI_FIELD_TYPES;

const {
	CUIError,
	CUIValidationError,
	CUIValidationFault,
	CUICSRFError,
	CUIActionNotSupportedError,
} = require('./src/types/errors');
module.exports.CUIError = CUIError;
module.exports.CUIValidationError = CUIValidationError;
module.exports.CUIValidationFault = CUIValidationFault;
module.exports.CUICSRFError = CUICSRFError;
module.exports.CUIActionNotSupportedError = CUIActionNotSupportedError;

const { CUIOptions } = require('./src/types/options');
module.exports.CUIOptions = CUIOptions;

const { CUIField } = require('./src/types/fields');
module.exports.CUIField = CUIField;

const { CUIActions } = require('./src/types/actions');
module.exports.CUIActions = CUIActions;

const { CUINavigation, CUINavigationItem } = require('./src/types/navigation');
module.exports.CUINavigation = CUINavigation;
module.exports.CUINavigationItem = CUINavigationItem;

const { CUITweaks } = require('./src/types/tweaks');
module.exports.CUITweaks = CUITweaks;

const { CUIViews } = require('./src/types/views');
module.exports.CUIViews = CUIViews;
/** @type {CUIViews} */
module.exports.DEFAULT_VIEWS = require('./src/types/views');

const { CUITexts } = require('./src/types/texts');
module.exports.CUITexts = CUITexts;
/** @type {CUITexts} */
module.exports.DEFAULT_TEXTS = CUITexts;

const { CUIIcons, ICON_NAMES } = require('./src/types/icons');
module.exports.CUIIcons = CUIIcons;
/** @type {CUIIcons} */
module.exports.DEFAULT_TEXTS = CUIIcons;
module.exports.ICON_NAMES = ICON_NAMES;

const { CUIContext } = require('./src/types/context');
module.exports.CUIContext = CUIContext;

const tools = require('./src/tools');
module.exports.tools = tools;
