import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

/**
 * Flat config. eslint-config-next 16 ships flat configs directly, so no
 * FlatCompat shim is needed.
 */
const eslintConfig = [
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'supabase/**'] },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];

export default eslintConfig;
