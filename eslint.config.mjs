import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs}'],
        plugins: { js },
        extends: ['js/recommended'],
    },
    {
        files: ['**/*.{js,mjs,cjs}'],
        languageOptions: { globals: globals.browser },
    },
    {
        rules: {
            indent: ['warn', 4, { SwitchCase: 1 }],
            quotes: ['warn', 'single', { avoidEscape: true }],
            'comma-dangle': ['warn', 'never'],
            semi: ['warn', 'always'],
            'object-curly-spacing': ['warn', 'always'],
            'array-bracket-spacing': ['warn', 'always'],
        },
    },
]);
