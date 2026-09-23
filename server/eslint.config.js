import js from '@eslint/js';
export default [js.configs.recommended, {files:['**/*.js'], languageOptions:{ecmaVersion:2022,sourceType:'module',globals:{process:'readonly',Buffer:'readonly',console:'readonly'}}, rules:{'no-unused-vars':['error',{argsIgnorePattern:'^_'}]}}];
