// Import base ESLint configurations
import js from '@eslint/js'

// Import global variable definitions for different environments
import globals from 'globals'

// Import React Hooks linting rules
import reactHooks from 'eslint-plugin-react-hooks'

// Import React Refresh linting rules for Vite environment
import reactRefresh from 'eslint-plugin-react-refresh'

// Import ESLint configuration utilities
import { defineConfig, globalIgnores } from 'eslint/config'

/**
 * ESLint configuration for the Nway Htway Web App
 * This configuration enforces code quality and best practices
 * @see {@link https://eslint.org/docs/latest/use/configure/} ESLint configuration documentation
 */
export default defineConfig([
  // Ignore build output directory
  globalIgnores(['dist']),

  // Main configuration for JavaScript and JSX files
  {
    // Target all JavaScript and JSX files
    files: ['**/*.{js,jsx}'],

    // Extend recommended configurations
    extends: [
      js.configs.recommended,                    // ESLint's recommended rules
      reactHooks.configs.flat.recommended,      // React Hooks rules
      reactRefresh.configs.vite,                // React Refresh rules for Vite
    ],

    // Language-specific options
    languageOptions: {
      ecmaVersion: 2020,                        // Use ECMAScript 2020 features
      globals: globals.browser,                 // Browser global variables
      parserOptions: {
        ecmaVersion: 'latest',                  // Use latest ECMAScript syntax
        ecmaFeatures: { jsx: true },            // Enable JSX parsing
        sourceType: 'module',                   // Use ES modules
      },
    },

    // Custom rules for this project
    rules: {
      // Allow unused variables that start with uppercase letter or underscore
      // This is useful for React components and constants
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
