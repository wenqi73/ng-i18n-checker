#!/usr/bin/env node
import yargs = require('yargs');
import { existsSync } from 'fs';
import { sync } from 'glob';
import { resolve } from 'path';

import { Pretty } from './reporters/Pretty';
import { I18nValidator, IProblem, IReporter } from './Validator';

const knownReporters: { [name: string]: IReporter } = {
    pretty: new Pretty(),
};

interface ICLIOpts {
    reporters: string[];
    ignoreTags: string[];
    attributePattern: RegExp;
    _: string[];
    help: boolean;
}

const args: ICLIOpts = yargs.usage(
    'Usage: ng-18-checker -r reporter1 reporter2 -i ignoredTag1 ignoredTag2 -p attributePattern fileGlob1 fileGlob2 ...',
)
.help()
.array('reporters')
.default('reporters', ['pretty'])
.describe('reporters', 'List of reporters to use, can also be path to custom file')

.array('ignoreTags')
.alias('ignoreTags', 'i')
.default('ignoreTags', [])
.describe('ignoreTags', 'List of html tags to ignore')

.string('attributePattern')
.alias('attributePattern', 'p')
.default('attributePattern', /^([\w-]+)#(\w+):(\w+)\|.*?$/.toString())
.coerce<string, RegExp>('attributePattern', str => new RegExp(str))
.describe('attributePattern', 'Pattern to match the i18n attribute content with')
.argv;

if (args.help) {
    process.exit(0);
}

if (args._.length === 0) {
    process.exit(0);
}

const validator = new I18nValidator({
    attrPattern: args.attributePattern,
    ignoreTags: args.ignoreTags,
});

let problems: IProblem[] = [];

let filesFound = false;

const reporters: IReporter[] = args.reporters.map(nameOrFile => {
    const potentialFilePath = resolve(nameOrFile);
    if (existsSync(potentialFilePath)) {
        return require(potentialFilePath); // tslint:disable-line non-literal-require
    }
    if (nameOrFile in knownReporters) {
        return knownReporters[nameOrFile];
    }
    console.error(`Unknown reporter ${nameOrFile}!`);
    process.exit(1);
});
args._.forEach(pattern => sync(pattern).forEach(file => {
    filesFound = true;
    problems = problems.concat(validator.processFile(file));
}));
reporters.forEach(reporter => reporter.report(problems));

if (problems.length !== 0) {
    process.exit(1);
}

if (!filesFound) {
    console.warn('No files processed');
}

process.exit(0);
