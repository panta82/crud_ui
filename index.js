const { crudButQuick } = require('./src/crud_but_quick');
const { CBQ_FIELD_TYPES } = require('./src/types/consts');
const { CBQError } = require('./src/types/errors');
const { CBQOptions, CBQHandlers } = require('./src/types/options');
const { CBQField } = require('./src/types/fields');
const { CBQContext } = require('./src/types/context');

module.exports = crudButQuick;
module.exports.crudButQuick = crudButQuick;

module.exports.FIELD_TYPES = CBQ_FIELD_TYPES;

module.exports.CBQError = CBQError;
module.exports.CBQOptions = CBQOptions;
module.exports.CBQHandlers = CBQHandlers;
module.exports.CBQField = CBQField;
module.exports.CBQContext = CBQContext;
