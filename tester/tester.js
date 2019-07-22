const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const port = process.env.PORT || 3000;

const crudButQuick = require('../');

const app = express();
app.use(bodyParser.json());

app.use(
	'/',
	crudButQuick({
		fields: [
			{
				type: 'string',
				name: 'name',
				label: 'Name',
			},
		],
		list: () => {
			return [{ name: 'a' }, { name: 'b' }];
		},
	})
);

const server = http.createServer(app);
server.listen(port, () => {
	console.log(`Listening on http://localhost:${port}`);
});
