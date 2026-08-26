import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';
import tseslint from 'typescript-eslint';


export default [
  { ignores: ['*.config.js', 'libs/', 'node_modules/', 'dist/', '.expo/', '~/'] },

  { languageOptions: { globals: globals.browser } },
  {
    settings: {
      'react': {
        'version': 'detect'
      }
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    ignores: ['**/*.config.js'],
    rules: {

      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/display-name': 'off',
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-useless-escape': 'off',

      // Enforce 2-space indentation
      //'indent': ['error', 2],
      // Enforce single quotes for strings
      //  'quotes': ['error', 'single'],
      // Enforce consistent semicolon usage
      'semi': ['error', 'always'],
      // Enforce consistent linebreak style
      'linebreak-style': 'off',
      // Enforce spacing inside braces
      'object-curly-spacing': ['error', 'always'],
      // Disable rule (example)

    }

  },

];