import { renameSync } from 'node:fs';

renameSync('./dist/esm/index.js', './dist/esm/index.mjs');
renameSync('./dist/esm/index.js.map', './dist/esm/index.mjs.map');
renameSync('./dist/esm/index.d.ts', './dist/esm/index.d.mts');
renameSync('./dist/esm/index.d.ts.map', './dist/esm/index.d.mts.map');
