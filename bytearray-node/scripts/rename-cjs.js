import { renameSync } from 'node:fs';

renameSync('./dist/cjs/index.js', './dist/cjs/index.cjs');
renameSync('./dist/cjs/index.js.map', './dist/cjs/index.cjs.map');
renameSync('./dist/cjs/index.d.ts', './dist/cjs/index.d.cts');
renameSync('./dist/cjs/index.d.ts.map', './dist/cjs/index.d.cts.map');
