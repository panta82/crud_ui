const express = require('express');

const { CBCOptions } = require('./types');

/**
 * Create express.js router that will serve a CRUD ui
 * @param {CBCOptions} options
 */
function crudButQuick(options) {
	options = new CBCOptions(options);

	const router = express.Router();

	router.get('/', (req, res) => {
		res.send('hooked up');
	});

	return router;
}

module.exports = {
	crudButQuick,
};
