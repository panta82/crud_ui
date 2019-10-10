'use strict';

const http = require('http');
const libPath = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const port = process.env.PORT || 3000;

const { crudUI, CUIField, FIELD_TYPES, CUITexts, CUIIcons, ICON_NAMES } = require('../../');

const app = express();
app.use(bodyParser.json());

const data = {
	users: [
		{
			id: 1,
			name: 'Axe',
			description:
				'Quick brown fox jumps over a lazy dog. Quick brown fox jumps over a lazy dog. Quick brown fox jumps over a lazy dog. Quick brown fox jumps over a lazy dog.',
		},
		{ id: 2, name: 'Barry', description: 'This\nIs\nBarry!' },
		{ id: 3, name: 'Cindy', gender: 'female' },
	],
	projects: [
		{ id: 1, name: 'Axe store', link: 'https://axes.com' },
		{ id: 2, name: 'Blog', link: 'https://blog.com' },
	],
	options: {
		darkMode: true,
		emailAlerts: false,
		smsAlerts: false,
		defaultProjectName: '',
	},
};

const navigation = {
	brand: {
		title: 'Tester',
		url: '/admin/users',
	},
	left: [
		{
			title: 'Users',
			url: '/admin/users',
			icon: ICON_NAMES.users,
		},
		{
			title: 'Projects',
			url: '/admin/projects',
			icon: ICON_NAMES.list_alt,
		},
		{
			title: 'Options',
			url: '/admin/options',
			icon: ICON_NAMES.cogs,
		},
	],
	right: [
		{
			title: 'User',
			items: [
				{
					render: (/** CUIContext */ ctx) => {
						return `<button class="dropdown-item" onclick="alert('logout')">Log out</button>`;
					},
				},
			],
		},
	],
};

const actions = list => ({
	getList: ctx => {
		return list;
	},
	getSingle: (ctx, id) => {
		return list.find(item => String(item.id) === String(id));
	},
	create: (ctx, payload) => {
		const id = list.reduce((max, item) => Math.max(item.id, max), 0) + 1;
		const item = { ...payload, id };
		list.push(item);
		return item;
	},
	update: (ctx, id, payload) => {
		const existing = list.find(item => String(item.id) === String(id));
		if (!existing) {
			throw new Error(`Not found: ${id}`);
		}
		Object.assign(existing, payload);
		return existing;
	},
	delete: (ctx, id) => {
		const index = list.findIndex(item => String(item.id) === String(id));
		if (index < 0) {
			throw new Error(`Not found: ${id}`);
		}
		const item = list.splice(index, 1)[0];
		return item;
	},
});

const customAssets = express.static(libPath.resolve(__dirname, './custom_static'));

app.use(
	'/admin/users',
	customAssets,
	crudUI({
		name: 'user',
		recordId: 'id',
		navigation,
		texts: new CUITexts({
			listEditButton: 'Change',
			listDeleteButton: '',
			listConfirmDeleteNoButton: '',
		}),
		icons: new CUIIcons({
			listCreateButton: 'fa-plus',
			listEditButton: null,
		}),
		tweaks: {
			allowBothListAndDetailViews: true,
			showValidationErrorSummary: false,
		},
		fields: [
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
				validate: {
					inclusion: {
						within: ['male', 'female'],
					},
				},
			}),
		],
		actions: actions(data.users),
		debugLog: true,
	})
);

app.use(
	'/admin/projects',
	customAssets,
	crudUI({
		name: 'project',
		navigation,
		isProduction: true,
		fields: [
			new CUIField({
				name: 'name',
				helpText: 'Project name',
				validate: {
					length: { minimum: 3 },
				},
			}),
			new CUIField({
				name: 'link',
				validate: {
					url: true,
				},
				listView: link =>
					`<a href="${link}" target="_blank" rel="nofollow noreferrer noopener">URL</a>`,
			}),
			new CUIField({
				name: 'password',
				type: 'secret',
				allowList: false,
			}),
			new CUIField({
				name: 'terms',
				type: 'boolean',
				title: 'Terms',
				label: 'I agree with terms of this project',
				allowEditExisting: false,
				validate: {
					equality: {
						attribute: 'dummy',
						comparator: x => {
							return x === true;
						},
						message: 'must be agreed to',
					},
				},
			}),
		],
		actions: actions(data.projects),
	})
);

app.use(
	'/admin/options',
	customAssets,
	crudUI({
		name: 'options',
		navigation,
		isProduction: true,
		tweaks: {
			singleRecordMode: true,
		},
		fields: [
			new CUIField({
				name: 'darkMode',
				type: FIELD_TYPES.boolean,
			}),
			new CUIField({
				name: 'emailAlerts',
				type: FIELD_TYPES.boolean,
			}),
			new CUIField({
				name: 'smsAlerts',
				type: FIELD_TYPES.boolean,
			}),
			new CUIField({
				name: 'defaultProjectName',
				type: FIELD_TYPES.string,
			}),
		],
		actions: {
			getSingle: () => data.options,
			update: val => {
				data.options = val;
				return data.options;
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
