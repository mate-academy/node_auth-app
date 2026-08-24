'use strict';

const fs = require('node:fs');
const path = require('node:path');

const envPath = path.join(process.cwd(), '.env');

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);

  lines.forEach((line) => {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);

    if (!match || process.env[match[1]] !== undefined) {
      return;
    }

    const value = match[2].replace(/^(['"])(.*)\1$/, '$2');

    process.env[match[1]] = value;
  });
}
