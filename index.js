const { crudButQuick } = require('./src/crud_but_quick');
const { CBQ_FIELD_TYPES } = require('./src/consts');
const { CBQError, CBQContext, CBQField, CBQHandlers, CBQOptions } = require('./src/types');

module.exports = crudButQuick;
module.exports.crudButQuick = crudButQuick;

module.exports.FIELD_TYPES = CBQ_FIELD_TYPES;

module.exports.CBQError = CBQError;
module.exports.CBQOptions = CBQOptions;
module.exports.CBQHandlers = CBQHandlers;
module.exports.CBQField = CBQField;
module.exports.CBQContext = CBQContext;
