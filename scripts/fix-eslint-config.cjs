const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const jsConfigPath = path.join(projectRoot, '.eslintrc.js');
const cjsConfigPath = path.join(projectRoot, '.eslintrc.cjs');

if (fs.existsSync(jsConfigPath)) {
  if (fs.existsSync(cjsConfigPath)) {
    fs.rmSync(jsConfigPath);
  } else {
    fs.renameSync(jsConfigPath, cjsConfigPath);
  }
}
