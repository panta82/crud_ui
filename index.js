'use strict';

const { crudUI } = require('./src/crud_ui');
const { CUI_FIELD_TYPES } = require('./src/types/consts');
const {
	CUIError,
	CUIValidationError,
	CUIValidationFault,
	CUICSRFError,
	CUIActionNotSupportedError,
} = require('./src/types/errors');
const { CUINavigation, CUINavigationItem } = require('./src/types/navigation');
const { CUIOptions } = require('./src/types/options');
const { CUIField } = require('./src/types/fields');
const { CUIActions } = require('./src/types/actions');
const { CUIViews } = require('./src/types/views');
const { CUITexts } = require('./src/types/texts');
const { CUIIcons, ICON_NAMES } = require('./src/types/icons');
const { CUIContext } = require('./src/types/context');

module.exports = crudUI;
module.exports.crudUI = crudUI;

module.exports.FIELD_TYPES = CUI_FIELD_TYPES;

module.exports.CUIError = CUIError;
module.exports.CUIValidationError = CUIValidationError;
module.exports.CUIValidationFault = CUIValidationFault;
module.exports.CUICSRFError = CUICSRFError;
module.exports.CUIActionNotSupportedError = CUIActionNotSupportedError;

module.exports.CUINavigation = CUINavigation;
module.exports.CUINavigationItem = CUINavigationItem;

module.exports.CUIOptions = CUIOptions;

module.exports.CUIField = CUIField;

module.exports.CUIActions = CUIActions;

module.exports.CUIViews = CUIViews;
/** @type {CUIViews} */
module.exports.DEFAULT_VIEWS = CUIViews;

module.exports.CUITexts = CUITexts;
/** @type {CUITexts} */
module.exports.DEFAULT_TEXTS = CUITexts;

module.exports.CUIIcons = CUIIcons;
/** @type {CUIIcons} */
module.exports.DEFAULT_TEXTS = CUIIcons;
module.exports.ICON_NAMES = ICON_NAMES;

module.exports.CUIContext = CUIContext;
