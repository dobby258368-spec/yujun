import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 從 GEO 原樣複製的檔案（修改點見 geo/patches/），維持與 GEO 相同，不套這裡的規則
    "src/components/blocks/BlockEditor.tsx",
    "src/components/editor/**",
    "src/components/ui/Modal.tsx",
    "src/lib/api.ts",
    "src/app/(editor)/dashboard/**",
    // 從 GEO 原樣複製的檔案（修改點見 geo/patches/），維持與 GEO 相同，不套這裡的規則
    "src/components/blocks/BlockEditor.tsx",
    "src/components/editor/**",
    "src/components/ui/Modal.tsx",
    "src/lib/api.ts",
    "src/app/(editor)/dashboard/**",
  ]),
]);

export default eslintConfig;
