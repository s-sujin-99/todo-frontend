/**
 * Prettier 설정
 *
 * 서식(포맷)은 전적으로 Prettier가 담당하고, ESLint는 코드 품질만 본다.
 * 두 도구의 역할을 분리해야 규칙 충돌과 무한 수정 루프가 생기지 않는다.
 *
 * @type {import("prettier").Config}
 */
const config = {
  // --- 기본 서식 ---
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  arrowParens: "always",
  bracketSpacing: true,

  // Windows 환경이지만 저장소 표준은 LF다(.gitattributes와 짝을 이룬다).
  endOfLine: "lf",

  // --- 플러그인 ---
  // 주의: prettier-plugin-tailwindcss는 반드시 배열의 마지막이어야 한다.
  // 다른 플러그인의 출력 위에서 클래스 정렬을 수행하기 때문이다.
  plugins: ["@ianvs/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],

  // --- import 자동 정렬 (@ianvs/prettier-plugin-sort-imports) ---
  // 빈 문자열("")은 그룹 사이의 빈 줄을 의미한다.
  importOrder: [
    "^(react/(.*)$)|^(react$)",
    "^(next/(.*)$)|^(next$)",
    "",
    "<THIRD_PARTY_MODULES>",
    "",
    "^@/lib/(.*)$",
    "^@/hooks/(.*)$",
    "^@/components/ui/(.*)$",
    "^@/components/(.*)$",
    "^@/(.*)$",
    "",
    "^[./]",
  ],
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  importOrderTypeScriptVersion: "5.0.0",

  // --- Tailwind CSS v4 클래스 정렬 ---
  // v4에는 tailwind.config.js가 없고 CSS 파일이 설정 진입점이므로
  // 테마와 커스텀 유틸리티를 읽을 수 있도록 경로를 명시한다.
  tailwindStylesheet: "./app/globals.css",
  // cn()/clsx()/cva() 안에 들어가는 클래스 문자열도 정렬 대상에 포함한다.
  tailwindFunctions: ["cn", "clsx", "cva", "twMerge"],

  // --- 파일 유형별 예외 ---
  overrides: [
    {
      files: ["*.md", "*.mdx"],
      options: {
        // 문서는 원문 줄바꿈을 존중한다(한국어 문장이 임의로 합쳐지는 것을 방지).
        proseWrap: "preserve",
      },
    },
    {
      files: ["*.json", "*.jsonc"],
      options: { printWidth: 80 },
    },
  ],
};

export default config;
