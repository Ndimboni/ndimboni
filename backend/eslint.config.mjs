// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'eslint.config.mjs', 
      'dist/**', 
      'node_modules/**', 
      '*.js',
      'coverage/**',
      'data/**',
      'uploads/**',
      '.env*',
      '*.log',
      '.DS_Store',
      '.vscode/**',
      '.git/**'
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended, // Use recommended instead of recommendedTypeChecked
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // TypeScript-specific rules - make them more lenient
      '@typescript-eslint/no-explicit-any': 'off', // Disable any warnings - use TypeScript for safety
      '@typescript-eslint/no-unsafe-call': 'off', // Disable unsafe call errors
      '@typescript-eslint/no-unsafe-member-access': 'off', // Disable unsafe member access
      '@typescript-eslint/no-unsafe-assignment': 'off', // Disable unsafe assignment
      '@typescript-eslint/no-unsafe-argument': 'off', // Disable unsafe argument
      '@typescript-eslint/no-unsafe-return': 'off', // Disable unsafe return
      '@typescript-eslint/no-floating-promises': 'warn', // Keep as warning
      '@typescript-eslint/no-misused-promises': 'warn', // Keep as warning
      '@typescript-eslint/restrict-template-expressions': 'off', // Allow any in template literals
      '@typescript-eslint/restrict-plus-operands': 'off', // Allow flexible plus operations
      '@typescript-eslint/unbound-method': 'off', // Disable unbound method checks
      
      // General ESLint rules
      'no-unused-vars': 'off', // Use TypeScript version instead
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      
      // Allow console for logging in backend
      'no-console': ['warn', { allow: ['log', 'warn', 'error'] }],
      
      // Disable some overly strict rules
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      
      // Prettier integration
      'prettier/prettier': ['error', {
        endOfLine: 'auto',
      }],
    },
  },
);