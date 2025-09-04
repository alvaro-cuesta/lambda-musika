import js from '@eslint/js';
import reactDom from 'eslint-plugin-react-dom';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactX from 'eslint-plugin-react-x';
import { globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
      reactX.configs['recommended-typescript'],
      reactDom.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: [
          './tsconfig.app.json',
          './tsconfig.node.json',
          './tsconfig.test.json',
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/dot-notation': [
        'error',
        {
          allowIndexSignaturePropertyAccess: true,
        },
      ],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allow: [{ name: ['Error', 'URL', 'URLSearchParams'], from: 'lib' }],
          allowAny: false,
          allowArray: false,
          allowBoolean: true,
          allowNever: false,
          allowNullish: true,
          allowNumber: true,
          allowRegExp: true,
        },
      ],
      '@typescript-eslint/no-deprecated': [
        'error',
        {
          allow: [
            // @todo Remove this once migrated to AudioWorkletNode
            'ScriptProcessorNode',
            'createScriptProcessor',
            'AudioProcessingEvent',
            'onaudioprocess',
            'outputBuffer',
          ],
        },
      ],
      '@typescript-eslint/unified-signatures': [
        'error',
        {
          ignoreDifferentlyNamedParameters: true,
          ignoreOverloadsWithDifferentJSDoc: true,
        },
      ],
    },
  },
]);
