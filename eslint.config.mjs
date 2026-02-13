import neostandard from 'neostandard';

export default [
  ...neostandard({ semi: true }),
  {
    ignores: ['node_modules/*', 'docs/*']
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        before: 'readonly',
        after: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly'
      }
    }
  }
];
