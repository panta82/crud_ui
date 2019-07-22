const libPath = require('path');

const express = require('express');

const { CBCOptions } = require('./types');
const views = require('./views');

/**
 * Create express.js router that will serve a CRUD ui
 * @param {CBCOptions} options
 */
function crudButQuick(options) {
	options = new CBCOptions(options);

	const router = express.Router();

	router.use(express.static(libPath.resolve(__dirname, '../static')));

	router.get('/', (req, res) => {
		res.header('Content-Type', 'text/html').send(views.layout(options, '<h1>test</h1>'));
	});

	return router;
}

module.exports = {
	crudButQuick,
};
