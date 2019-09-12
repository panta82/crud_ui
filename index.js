const { crudUI } = require('./src/crud_ui');
const { CUI_FIELD_TYPES } = require('./src/types/consts');
const { CUIError, CUIValidationError, CUIValidationFault, CUICSRFError, CUIActionNotSupportedError } = require('./src/types/errors');
const { CUINavigation, CUINavigationItem } = require('./src/types/navigation');
const { CUIOptions, CUIActions } = require('./src/types/options');
const { CUIField } = require('./src/types/fields');
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

module.exports.CUIActions = CUIActions;

module.exports.CUIField = CUIField;

module.exports.CUIContext = CUIContext;
