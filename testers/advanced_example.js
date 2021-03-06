'use strict';

const http = require('http');
const express = require('express');

const port = process.env.PORT || 3000;

const { crudUI, CUIField, FIELD_TYPES, CUI_MODES } = require('../');

const app = express();

const data = [
	{ id: 1, name: 'Axe' },
	{ id: 2, name: 'Barry', description: 'This\nIs\nBarry!' },
	{ id: 3, name: 'Cindy', gender: 'female' },
];

app.use(
	'/admin/users',
	crudUI({
		name: 'user',
		mode: CUI_MODES.simple_list,
		recordId: 'id',
		navigation: {
			brand: {
				title: 'Tester',
				url: '/admin/users',
			},
			left: [
				{
					title: 'Users',
					url: '/admin/users',
				},
				{
					title: 'Projects',
					url: '/admin/projects',
				},
			],
			right: [
				{
					title: 'User',
					items: [
						{
							title: 'Home',
							url: '/admin/users',
						},
						{
							title: '---',
						},
						{
							render: (/** CUIContext */ ctx) => {
								return `<button class="dropdown-item" onclick="alert('logout')">Log out</button>`;
							},
						},
					],
				},
			],
		},
		fields: [
			new CUIField({
				type: FIELD_TYPES.string,
				name: 'id',
				label: 'ID',
				noEdit: true,
			}),
			new CUIField({
				type: FIELD_TYPES.string,
				name: 'name',
				label: 'Name',
				helpText: "Person's full name and surname",
				validate: {
					presence: {
						allowEmpty: false,
					},
				},
				validateEdit: {
					length: { minimum: 20 },
				},
			}),
			new CUIField({
				type: FIELD_TYPES.text,
				name: 'description',
				label: 'Description',
				validateCreate: (ctx, val) => {
					if (val.indexOf('cheese') < 0) {
						return 'must contain word cheese';
					}
				},
			}),
			new CUIField({
				type: FIELD_TYPES.select,
				name: 'gender',
				label: 'Gender',
				values: ['male', 'female', 'other'],
				nullOption: true,
			}),
		],
		actions: {
			getList: ctx => {
				return data;
			},
			getSingle: (ctx, id) => {
				return data.find(item => String(item.id) === String(id));
			},
			create: (ctx, payload) => {
				const id = data.reduce((max, item) => Math.max(item.id, max), 0) + 1;
				const item = { ...payload, id };
				data.push(item);
				return item;
			},
			update: (ctx, id, payload) => {
				const existing = data.find(item => String(item.id) === String(id));
				if (!existing) {
					throw new Error(`Not found: ${id}`);
				}
				Object.assign(existing, payload);
				return existing;
			},
			delete: (ctx, id) => {
				const index = data.findIndex(item => String(item.id) === String(id));
				if (index < 0) {
					throw new Error(`Not found: ${id}`);
				}
				const item = data.splice(index, 1)[0];
				return item;
			},
		},
	})
);

app.get('/', (req, res) => {
	return res.set('content-type', 'text/html').send(`
  <body>
    <h1>This is just a tester</h1>
    <h4>
      <a href="/admin/users">Go to admin</a>
    </h4>
  </body>
  `);
});

const server = http.createServer(app);
server.listen(port, () => {
	console.log(`Listening on http://localhost:${port}`);
});
