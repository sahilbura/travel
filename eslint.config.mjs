import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Global ignore patterns
  {
    ignores: [
      "**/node_modules/**",
      "**/coverage/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/scripts/legacy/**",
      "app/generated/prisma/**",
    ],
  },

  // Extend Next.js + TypeScript base rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Override rules for TypeScript files
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // "@typescript-eslint/no-this-alias": "off",
      
    },
  },
];

export default eslintConfig;
