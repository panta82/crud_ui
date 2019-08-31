const { microTemplate } = require('../src/tools');

describe('tools', () => {
	describe('microTemplate', () => {
		it('works', () => {
			// No replacement
			expect(microTemplate('abcde', { abcde: '_' })).toEqual('abcde');
			expect(microTemplate('abcde$', { abcde: '_' })).toEqual('abcde$');
			expect(microTemplate('$ _ $$ $< $', { $: 'HA' })).toEqual('$ _ $$ $< $');
			expect(microTemplate('1 \\$var 2', { var: 'no replace' })).toEqual('1 $var 2');

			// Form 1
			expect(microTemplate('a $b c $d e', { b: '_' })).toEqual('a _ c  e');
			expect(microTemplate('ab$cde', { cde: 'CDE' })).toEqual('abCDE');
			expect(microTemplate('$abc DE', { abc: 'ABC' })).toEqual('ABC DE');
			expect(microTemplate('$Ab___c', { Ab___c: 'Some text', unrelated: 'yawn' })).toEqual(
				'Some text'
			);

			// Form 2
			expect(microTemplate('a${b}c', { b: '_' })).toEqual('a_c');
			expect(microTemplate('${var1}b${var2}', { var1: 'a', var2: 'c' })).toEqual('abc');
			expect(microTemplate('${a}${b}$c$d', { a: 'A', b: 'B', c: 'C', d: 'D' })).toEqual('ABCD');

			// Escaping
			expect(microTemplate('\\$a$b', { a: '1', b: '2' })).toEqual('$a2');
			expect(microTemplate('\\$a\\$b', { a: '1', b: '2' })).toEqual('$a$b');
			expect(microTemplate('$a\\${b}', { a: '1', b: '2' })).toEqual('1${b}');

			expect(
				microTemplate('Some long sente${nce}, with various $WHAT${sign}', {
					nce: 'NCE',
					WHAT: 'replacements',
					sign: '!!!',
				})
			).toEqual('Some long senteNCE, with various replacements!!!');
		});
	});
});
