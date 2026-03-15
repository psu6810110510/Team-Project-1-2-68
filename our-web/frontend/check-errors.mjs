import ts from 'typescript';
import fs from 'fs';
import path from 'path';

const filePath = 'd:/Team-Project-1-2-68/our-web/frontend/src/pages/AdminDashboard.tsx';
const tsconfigPath = 'd:/Team-Project-1-2-68/our-web/frontend/tsconfig.json';

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

function checkFile() {
  const config = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  const parsedConfig = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(tsconfigPath));

  const options = { ...parsedConfig.options, jsx: ts.JsxEmit.React };
  const allFiles = getAllFiles('d:/Team-Project-1-2-68/our-web/frontend/src');
  const program = ts.createProgram(allFiles, options);
  const diagnostics = ts.getPreEmitDiagnostics(program);

  let errorCount = 0;
  let report = '';
  for (const diag of diagnostics) {
    if (diag.file) {
      const { line, character } = diag.file.getLineAndCharacterOfPosition(diag.start);
      const message = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
      report += `[${path.basename(diag.file.fileName)}] Error at line ${line + 1}, char ${character + 1}: ${message}\n`;
      errorCount++;
    }
  }
  report += `Total errors found: ${errorCount}\n`;
  fs.writeFileSync('error_report.txt', report);
  console.log(`Saved diagnostics to error_report.txt. Total: ${errorCount}`);
}

checkFile();
