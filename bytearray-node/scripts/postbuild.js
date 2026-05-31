const { existsSync, readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const cjsDistFile = join(__dirname, '../dist/cjs/index.cjs');
const cjsDtsFile = join(__dirname, '../dist/cjs/index.d.cts');

if (existsSync(cjsDistFile)) {
    let content = readFileSync(cjsDistFile, 'utf8');

    // Use regex to be resilient to spacing variations
    const exportPattern = /exports\.default\s*=\s*ByteArray;/;

    if (exportPattern.test(content)) {
        content = content.replace(exportPattern, 'module.exports = ByteArray;');

        writeFileSync(cjsDistFile, content, 'utf8');

        console.log(
            'Successfully updated CJS index.cjs to use module.exports = ByteArray'
        );
    } else
        console.warn(
            'Could not find exports.default = ByteArray; in CJS index.cjs'
        );
} else console.error('CJS index.cjs not found at:', cjsDistFile);

if (existsSync(cjsDtsFile)) {
    let content = readFileSync(cjsDtsFile, 'utf8');

    // Replace export default class ByteArray with class ByteArray and append export = ByteArray;
    const defaultClassPattern = /export\s+default\s+class\s+ByteArray/;

    if (defaultClassPattern.test(content)) {
        content = content.replace(defaultClassPattern, 'class ByteArray');
        content = content + '\nexport = ByteArray;\n';

        writeFileSync(cjsDtsFile, content, 'utf8');

        console.log(
            'Successfully updated CJS index.d.cts to use export = ByteArray'
        );
    } else
        console.warn(
            'Could not find export default class ByteArray in CJS index.d.cts'
        );
} else console.error('CJS index.d.cts not found at:', cjsDtsFile);
