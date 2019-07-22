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

	options.validateAndCoerce();

	const router = express.Router();

	router.use(express.static(libPath.resolve(__dirname, '../static')));

	router.get('/', (req, res) => {
		Promise.resolve()
			.then(() => options.list())
			.then(data => {
				res
					.header('Content-Type', 'text/html')
					.send(views.layout(options, views.list(options, data)));
			});
	});

	return router;
}

module.exports = {
	crudButQuick,
};
