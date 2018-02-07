import { IProblem, IReporter } from '../Validator';

export class Json implements IReporter {
  public async report(problems: IProblem[]): Promise<void> {
    console.log(JSON.stringify(problems)); // tslint:disable-line:no-console
  }
}
