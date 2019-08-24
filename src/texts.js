const { assertType, capitalize, pluralize } = require('./tools');

class CBQTexts {
	constructor(/** CBQTexts */ source) {
		this.listTitle = (/** CBQContext */ ctx) => pluralize(capitalize(ctx.options.name));
		this.listNoData = 'No data is available';

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
