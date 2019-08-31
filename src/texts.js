const { assertType, capitalize, uncapitalize, pluralize, singularize } = require('./tools');

class CBQTexts {
	constructor(/** CBQTexts */ source) {
		/**
		 * Text description of a particular record. Defaults to #id. So we would get text like "deleted user #13".
		 * @param {CBQContext} ctx
		 * @param record
		 * @return {string}
		 */
		this.recordDescriptor = (ctx, record) => `#${ctx.options.recordId(record)}`;

		this.listTitle = (/** CBQContext */ ctx) => pluralize(capitalize(ctx.options.name));
		this.listNoData = 'No data is available';

		this.editNewTitle = (/** CBQContext */ ctx) =>
			`Create a new ${uncapitalize(singularize(ctx.options.name))}`;
		this.editExistingTitle = (/** CBQContext */ ctx, record) =>
			`Edit ${uncapitalize(singularize(ctx.options.name))} ` +
			ctx.options.texts.recordDescriptor(ctx, record);

		this.errorNotFound = (/** CBQContext */ ctx, id) =>
			`${capitalize(singularize(ctx.options.name))} with id "${id}" couldn't be found`;

		this.footerBackToTop = 'Back to top';
		this.footerCopyright = (/** CBQContext */ ctx) => {
			return `Copyright ${new Date().getFullYear()}, All rights reserved.`;
		};

		// Turn all properties into functions
		Object.keys(this).forEach(key => {
			let getter = makeGetter(this[key]);
			Object.defineProperty(this, key, {
				get() {
					return getter;
				},
				set(newVal) {
					getter = makeGetter(newVal);
				},
			});
		});

		Object.assign(this, source);
	}
}

function makeGetter(val) {
	assertType(val, 'Text value', 'string', 'function');

	if (typeof val === 'string') {
		// Simple string getter
		return () => val;
	} else if (typeof val === 'function') {
		// Function getter
		return val;
	} else {
		throw new Error(`Invalid text value: ${val}. It must be either string or function`);
	}
}

module.exports = new CBQTexts();
module.exports.CBQTexts = CBQTexts;
