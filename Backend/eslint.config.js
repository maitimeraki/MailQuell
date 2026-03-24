const js = require("@eslint/js");
const globals = require("globals");
module.exports = [
    js.configs.recommended,
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "commonjs",
            globals: {
                ...globals.node,      // Adds Node.js globals (process, Buffer, etc.)
                ...globals.jest,       // Adds Jest globals (describe, test, expect, etc.)
            },
        },
        rules: {
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "no-console": "off",
            // OR set to warn
            "no-control-regex": "warn",
        },
    },
    // Special config for test files (optional but cleaner)
    {
        files: ["tests/**/*.js", "**/*.test.js", "**/*.spec.js"],
        languageOptions: {
            globals: {
                ...globals.jest,
            },
        },
    },
];