import { readFileSync } from 'fs';
import { Parser } from 'htmlparser2';

export interface IReporter {
  report(problems: IProblem[]): void;
}

interface IElementEntry {
  tag: string;
  ignored: boolean;
  i18n: string;
}

export interface IProblem {
  fileName: string;
  line: number;
  problem: 'missing' | 'format' | 'nested';
  meta: string;
}

export interface II18nValidatorOptions {
  attrPattern: RegExp;
  ignoreTags: string[];
  templateMatcher: RegExp;
  assumeTextCondition: RegExp;
  ignoreComment: RegExp;
  ignorePatterns: RegExp[];
}

/**
 * Main validator that performs checking.
 */
export class I18nValidator {
  public static readonly defaultAttributeMacher = /^([\w-]+)#(\w+):(\w+)\|.*?$/;
  public static readonly defaultTemplateMatcher = /\{\{.*?\}\}/g;
  public static readonly defaultAssumeTextCondition = /\w{2,}/;
  public static readonly defaultIgnoreComment = /^\s*ng-i18n-checker(:| )disable\s*$/;
  public static readonly urlRegEx = /\b\w+:\/\/\S+\b/gi;
  public static readonly emailRegEx = /\b[-a-z\d~!$%^&*_=+}{'?]+(\.[-a-z\d~!$%^&*_=+}{'?]+)*@([a-z\d_]+(\.[-a-z\d_]+)*\.[a-zрф]{2,})\b/gi;
  public static readonly htmlCharacaterRegEx = /\&[a-z0-9]+;/gi;

  private readonly options: II18nValidatorOptions;

  constructor(options: Partial<II18nValidatorOptions> = {}) {
    this.options = {
      attrPattern: I18nValidator.defaultAttributeMacher,
      ignoreTags: [],
      templateMatcher: I18nValidator.defaultTemplateMatcher,
      assumeTextCondition: I18nValidator.defaultAssumeTextCondition,
      ignoreComment: I18nValidator.defaultIgnoreComment,
      ignorePatterns: [
        I18nValidator.urlRegEx,
        I18nValidator.emailRegEx,
        I18nValidator.htmlCharacaterRegEx,
      ],
      ...options,
    };
  }

  public processFile(
    fileName: string,
    contents: string = readFileSync(fileName, 'utf8'),
  ): IProblem[] {
    const problems: IProblem[] = [];

    const lines = contents.split('\n');
    // Used to make sure we don't match identical text on the same position
    let lastLine = -1;
    const matchLine = (needle: string): number => {
      return (lastLine = lines.findIndex((l, idx) => idx >= lastLine && l.includes(needle)) + 1);
    };

    const stack: IElementEntry[] = [];
    let curr: IElementEntry;

    if (fileName.endsWith('.html')) {
      new Parser(
        {
          onopentag: (tag: string, attributes: { [attrName: string]: string }) => {
            // Check if any parent element already has i18n
            const i18nParent = stack.find(p => !!p.i18n);
            if (i18nParent && attributes['i18n']) {
              problems.push({
                fileName,
                line: matchLine(i18nParent.i18n),
                problem: 'nested',
                meta: curr.i18n,
              });
            }
            stack.push(
              (curr = {
                tag,
                ignored: curr ? curr.ignored : false,
                i18n: attributes['i18n'],
              }),
            );
            if (!attributes['i18n']) {
              return;
            }
            // Format mismatch
            const match = attributes['i18n'].match(this.options.attrPattern);
            if (!match) {
              problems.push({
                fileName,
                line: matchLine(attributes['i18n']),
                problem: 'format',
                meta: attributes['i18n'],
              });
            }
          },
          oncomment: (comment: string) => {
            if (this.options.ignoreComment.test(comment)) {
              curr.ignored = true;
            }
          },
          ontext: (text: string) => {
            if (this.shouldWarnAbout(stack, text)) {
              problems.push({
                fileName,
                line: matchLine(text.trim().split('\n')[0]),
                problem: 'missing',
                meta: text.trim(),
              });
            }
          },
          onclosetag: () => {
            stack.pop();
            curr = stack[stack.length - 1];
          },
        },
        {
          recognizeSelfClosing: true,
        },
      ).parseComplete(contents);
    } else if (fileName.endsWith('.ts')) {

    }

    return problems;
  }

  /**
   * Returns whether we need to report a problem about the current element
   * in the stack missing i18n tags for the provided text.
   */
  private shouldWarnAbout(stack: IElementEntry[], text: string): boolean {
    if (this.validateElement(stack[stack.length - 1])) {
      return false;
    }

    let filtered = text;
    this.options.ignorePatterns.forEach(pattern => {
      filtered = filtered.replace(pattern, '');
    });

    // Remove template tags
    filtered = filtered.replace(this.options.templateMatcher, '');
    // Remove extraneous whitespace.
    filtered = filtered.replace(/[^\w\s]|_/g, '').trim();

    const containsAnythingMeaningful = this.options.assumeTextCondition.test(filtered);

    return filtered !== '' && containsAnythingMeaningful && !stack.some(p => !!p.i18n);
  }

  /**
   * Returns true if the element is ignored or if it has an i18n tag;
   * we do not need to throw any warnings about it.
   */
  private validateElement(el: IElementEntry): boolean {
    if (!el) {
      return true;
    }

    if (this.options.ignoreTags.includes(el.tag)) {
      return true;
    }

    return el.ignored || !!el.i18n;
  }
}
