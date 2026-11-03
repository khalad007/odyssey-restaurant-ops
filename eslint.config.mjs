import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/node_modules/**', '**/.turbo/**', '**/dist/**', '**/generated/**'] },
  ...tseslint.configs.recommended,
);
