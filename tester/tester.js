const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const port = process.env.PORT || 3000;

const { crudButQuick, CBQField, FIELD_TYPES } = require('../');

const app = express();
app.use(bodyParser.json());

const data = [
	{ id: 1, name: 'Axe' },
	{ id: 2, name: 'Barry', description: 'This\nIs\nBarry!' },
	{ id: 3, name: 'Cindy', gender: 'female' },
];

app.use(
	'/',
	crudButQuick({
		name: 'user',
		fields: [
			{
				type: FIELD_TYPES.string,
				name: 'id',
				label: 'ID',
			},
			{
				type: FIELD_TYPES.string,
				name: 'name',
				label: 'Name',
			},
			new CBQField({
				type: FIELD_TYPES.text,
				name: 'description',
				label: 'Description',
			}),
			new CBQField({
				type: FIELD_TYPES.select,
				name: 'gender',
				label: 'Gender',
				defaultValue: 'male',
				values: ['male', 'female', 'other'],
				nullOption: true,
			}),
		],
		recordId: 'id',
		handlers: {
			list: ctx => {
				return data;
			},
			single: (ctx, id) => {
				return data.find(item => String(item.id) === String(id));
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
