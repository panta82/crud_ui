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
		name: 'Items',
		fields: [
			{
				type: 'string',
				name: 'name',
				label: 'Name',
			},
		],
		recordId: 'id',
		handlers: {
			list: () => {
				return [{ name: 'a' }, { name: 'b' }];
			},
			delete: () => {},
			update: () => {},
		},
	})
);

app.get('/', (req, res) => {
	return res.set('content-type', 'text/html').send(`
	<body>
		<h1>This is just a tester</h1>
		<h4>
			<a href="/my/sub/route">Go to CMS</a>
		</h4>
	</body>
	`);
});

const server = http.createServer(app);
server.listen(port, () => {
	console.log(`Listening on http://localhost:${port}`);
});
