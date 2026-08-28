/**
 * lint-staged 설정
 *
 * 스테이징된 파일만 검사하므로 커밋이 프로젝트 크기와 무관하게 빠르다.
 * 단, 타입 검사만은 예외다 — 타입은 파일 하나만 떼어 검사할 수 없고
 * (그 파일이 import하는 모든 것을 함께 봐야 한다), tsconfig의 include/paths를
 * 무시하게 되므로 반드시 프로젝트 전체(`tsc --noEmit`)로 돌려야 한다.
 *
 * 배열로 준 명령들은 위에서 아래로 순차 실행된다.
 * "고치고(eslint --fix) → 서식 맞추고(prettier) → 검증(tsc)" 순서가 중요하다.
 * 검증을 먼저 하면 자동수정 결과가 반영되지 않은 상태를 검사하게 된다.
 */

/** 경로에 공백이 있어도 안전하도록 인용부호로 감싼다. */
const quote = (files) => files.map((f) => JSON.stringify(f)).join(" ");

const config = {
  // --- TypeScript 소스 ---
  "*.{ts,tsx,mts,cts}": (files) => [
    // --no-warn-ignored: globalIgnores 대상 파일이 섞여도 실패시키지 않는다.
    `eslint --fix --no-warn-ignored ${quote(files)}`,
    `prettier --write --ignore-unknown ${quote(files)}`,
    // 파일 목록을 받지 않고 프로젝트 전체를 검사한다(위 주석 참고).
    "tsc --noEmit",
  ],

  // --- 설정용 JavaScript (eslint.config.mjs 등) ---
  // tsconfig에 포함되지 않으므로 타입 검사 대상에서 제외한다.
  "*.{js,mjs,cjs}": (files) => [
    `eslint --fix --no-warn-ignored ${quote(files)}`,
    `prettier --write --ignore-unknown ${quote(files)}`,
  ],

  // --- 서식만 적용하는 파일들 ---
  "*.{json,jsonc,css,scss,md,mdx,yml,yaml,html}": (files) => [
    `prettier --write --ignore-unknown ${quote(files)}`,
  ],

  // --- 비밀정보 스캔 (모든 스테이징 파일) ---
  // API 키·토큰·비밀번호가 커밋에 섞여 들어가는 것을 차단한다.
  // git 히스토리에 한 번 올라간 비밀값은 되돌리기가 매우 어렵기 때문에
  // "커밋되기 전"이 사실상 유일한 방어 시점이다.
  "*": (files) => [`secretlint --maskSecrets --secretlintignore .secretlintignore ${quote(files)}`],
};

export default config;
