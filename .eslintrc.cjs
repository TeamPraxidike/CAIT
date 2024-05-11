module.exports = {
    extends: [
        'plugin:svelte/recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    parserOptions: {
        extraFileExtensions: ['.svelte']
    },
    overrides: [
        {
            files: ['*.svelte'],
            parser: 'svelte-eslint-parser',
            parserOptions: {
                parser: '@typescript-eslint/parser'
            }
        }
    ],
    rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',


    }
};