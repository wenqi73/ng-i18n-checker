// import * as fs from 'fs';
import * as ts from 'typescript';
import * as path from 'path';


generateDocumentation([path.resolve(__dirname, './angular.ts')], {
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS,
});


function generateDocumentation(
  fileNames: string[],
  options: ts.CompilerOptions,
): void {
  // Build a program using the set of root file names in fileNames
  let program = ts.createProgram(fileNames, options);

  // Get the checker, we will use it to find more about classes
  // let checker = program.getTypeChecker();
  // let output: DocEntry[] = [];
  let code = '';
  // Visit every sourceFile in the program
  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile) {
      // Walk the tree to search for classes
      code = sourceFile.text;
      ts.forEachChild(sourceFile, visit);
    }
  }

  // print out the doc
  // fs.writeFileSync("classes.json", JSON.stringify(output, undefined, 4));

  return;

  /** visit nodes finding exported classes */
  function visit(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.StringLiteral: {
        /** 判断 Ts 中的字符串含有中文 */
        const { text } = node as ts.StringLiteral;
        console.log(text);
        break;
      }
      case ts.SyntaxKind.TemplateExpression: {
        const { pos, end } = node;
        const templateContent = code.slice(pos, end);
        console.log(templateContent);
        // templateContent = templateContent.toString().replace(/\$\{[^\}]+\}/, '')
        // if (templateContent.match(DOUBLE_BYTE_REGEX)) {
        //   const start = node.getStart();
        //   const end = node.getEnd();
        //   /** 加一，减一的原因是，去除`号 */
        //   const startPos = activeEditor.document.positionAt(start + 1);
        //   const endPos = activeEditor.document.positionAt(end - 1);
        //   const range = new vscode.Range(startPos, endPos);
        //   matches.push({
        //     range,
        //     text: code.slice(start + 1, end - 1),
        //     isString: true
        //   });
        // }
        break;
      }
      case ts.SyntaxKind.NoSubstitutionTemplateLiteral: {
        const { pos, end } = node;
        const templateContent = code.slice(pos, end);
        console.log(templateContent);
      }
    }

    ts.forEachChild(node, visit);
  }
}

