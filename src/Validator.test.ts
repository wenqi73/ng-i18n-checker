import { I18nValidator } from './Validator';

import { expect } from 'chai';

describe('Validator', () => {
    let validator: I18nValidator;
    beforeEach(() => {
        validator = new I18nValidator({
            attrPattern: /\w+:\w+/,
            ignoreTags: ['code'],
        });
    });

    it('Reports missing i18n tags', () => {
        const problems = validator.processFile('dummy', '<span>Hello!</span>');
        expect(problems).to.deep.equal([{
            fileName: 'dummy',
            line: 1,
            meta: 'Hello!',
            problem: 'missing',
        }]);
    });

    it('Reports invalid i18n formats', () => {
        const problems = validator.processFile('dummy', '<span i18n="Hello">Hello!</span>');
        expect(problems).to.deep.equal([{
            fileName: 'dummy',
            line: 1,
            meta: 'Hello',
            problem: 'format',
        }]);
    });

    it('Reports nested i18n tags', () => {
        const problems = validator.processFile(
            'dummy',
            '<span i18n="Greeting:Hello user">Hello <span i18n="Text:User">User!</span></span>',
        );
        expect(problems).to.deep.equal([{
            fileName: 'dummy',
            line: 1,
            meta: 'Greeting:Hello user',
            problem: 'nested',
        }]);
    });

    it('Does not report missing i18n in nested tags', () => {
        const problems = validator.processFile('dummy', '<span i18n="Greeting:Hello user">Hello <span>User!</span></span>');
        expect(problems).to.deep.equal([]);
    });
});
