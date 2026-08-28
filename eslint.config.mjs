import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier/flat";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

/**
 * ESLint 설정 (Flat Config)
 *
 * 역할 분담:
 * - ESLint : 코드 품질과 잠재적 버그 (서식은 다루지 않는다)
 * - Prettier: 서식 전담
 * 그래서 배열 마지막에 eslint-config-prettier를 두어 서식 관련 규칙을 모두 끈다.
 */
const eslintConfig = defineConfig([
  // 1) 검사 제외 대상
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "coverage/**",
    "node_modules/**",
    "next-env.d.ts",
    "*.tsbuildinfo",
  ]),

  // 2) Next.js 기본 규칙 (Core Web Vitals + TypeScript)
  ...nextVitals,
  ...nextTs,

  // 3) 타입 정보를 사용하는 검사 — .ts/.tsx 에만 적용한다.
  //    설정 파일(.mjs)까지 포함시키면 tsconfig에 없는 파일이라 파서가 실패한다.
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        // projectService는 tsconfig를 자동으로 찾아 타입 정보를 제공한다.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // await를 빠뜨린 Promise를 잡는다. 비동기 API 호출에서 가장 흔한 실수다.
      "@typescript-eslint/no-floating-promises": "error",
      // onClick={async () => {}} 처럼 Promise를 잘못된 자리에 넘기는 경우를 잡는다.
      "@typescript-eslint/no-misused-promises": "error",
      // Promise가 아닌 값에 await를 거는 경우를 잡는다.
      "@typescript-eslint/await-thenable": "error",
      // 타입만 쓰는 import는 `import type`으로 강제해 런타임 번들에서 제외한다.
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
    },
  },

  // 4) 프로젝트 공통 품질 규칙
  {
    files: ["**/*.{js,mjs,ts,tsx}"],
    rules: {
      // 밑줄(_)로 시작하는 변수는 "의도적으로 쓰지 않음"으로 간주해 허용한다.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      // any는 막지 않되 눈에 띄게 둔다. 점진적으로 줄여나가기 위함이다.
      "@typescript-eslint/no-explicit-any": "warn",
      // console.log는 배포 코드에 남기지 않는다. 경고/에러 로그는 허용.
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // == 대신 === 사용 (null 비교는 예외로 허용).
      eqeqeq: ["error", "smart"],
      "no-var": "error",
      "prefer-const": "error",
      // debugger 구문이 커밋되는 것을 막는다.
      "no-debugger": "error",
    },
  },

  // 5) Prettier와 충돌하는 서식 규칙 비활성화 — 반드시 마지막에 위치해야 한다.
  prettierConfig,
]);

export default tseslint.config(eslintConfig);
