import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { 
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], 
    plugins: { js }, 
    extends: ["js/recommended"], 
    languageOptions: { 
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  tseslint.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: "detect"
      }
    }
  },
  {
    files: ["**/*.config.{js,cjs}", "**/metro.config.cjs", "**/babel.config.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        exports: "readonly"
      }
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off"
    }
  },
  {
    files: ["**/app/_layout.tsx"],
    rules: {
      "@typescript-eslint/no-require-imports": "off"
    }
  },
]);
