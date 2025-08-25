import packageJson from '../package.json' with { type: 'json' };

import { deepEqual } from 'node:assert';
import test from 'node:test';

import validateNpmPackageName, {
    type InvalidNames,
    type LegacyNames,
    type ValidNames
} from 'validate-npm-package-name';

test('validate package name', () => {
    const validationResult: ValidNames | InvalidNames | LegacyNames =
        validateNpmPackageName(packageJson.name);

    deepEqual(
        validationResult,
        {
            validForNewPackages: true,
            validForOldPackages: true
        },
        'Package name should be valid for both new and old packages'
    );
});
