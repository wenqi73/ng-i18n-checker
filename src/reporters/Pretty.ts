import { blue, green } from 'chalk';

import { IProblem, IReporter } from '../Validator';

export class Pretty implements IReporter {
  public async report(problems: IProblem[]): Promise<void> {
    if (problems.length === 0) {
      return;
    }
    problems.forEach(problem => {
      const prettyFile = `${green(problem.fileName.replace(`${process.cwd()}/`, ''))}:${
        problem.line
      }`;
      switch (problem.problem) {
        case 'missing':
          console.error(`${prettyFile}: Missing i18n in for text \`${blue(problem.meta)}\``);
          break;
        case 'format':
          console.error(`${prettyFile}: Invalid i18n format \`${blue(problem.meta)}\``);
          break;
        case 'nested':
          console.error(
            `${prettyFile}: Parent already already has attribute \`${blue(problem.meta)}\``,
          );
          break;
        default:
          throw new Error(`Unknown problem ${problem.problem}`);
      }
    });
    console.error(`Total problems: ${problems.length}`);
  }
}
