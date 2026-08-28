/**
 * commitlint 설정
 *
 * CLAUDE.md의 규칙("커밋 메시지는 한글로 작성")을 그대로 강제한다.
 * 기본 conventional 파서는 `\w`만 타입으로 인식해 한글 접두사를 파싱하지 못하므로,
 * 한글 타입과 선택적 이모지를 허용하는 커스텀 파서를 사용한다.
 *
 * 허용 형식:
 *   기능 추가: 사용자 인증 로직 구현
 *   버그 수정(auth): 로그인 페이지 렌더링 오류
 *   feat: add login form
 *   ✨ feat(auth): add login form
 *
 * @type {import("@commitlint/types").UserConfig}
 */
const config = {
  parserPreset: {
    parserOpts: {
      // [선택적 이모지] 타입 [(스코프)] [!] : 제목
      headerPattern: /^(?:[^\p{L}\p{N}\s]+\s*)?([\p{L}][\p{L}\s]*?)(?:\(([^)]*)\))?!?:\s(.+)$/u,
      headerCorrespondence: ["type", "scope", "subject"],
    },
  },

  rules: {
    // --- 구조 (위반 시 커밋 차단) ---
    "type-empty": [2, "never"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 100],
    "body-leading-blank": [2, "always"],
    "footer-leading-blank": [2, "always"],

    // --- 타입 목록 (위반 시 경고만: 커밋은 되지만 눈에 띈다) ---
    "type-enum": [
      1,
      "always",
      [
        // 한글 (권장)
        "기능 추가",
        "버그 수정",
        "리팩토링",
        "문서",
        "스타일",
        "테스트",
        "설정",
        "성능 개선",
        "빌드",
        "배포",
        "의존성",
        "제거",
        "되돌림",
        // 영문 conventional (도구·스킬 호환용)
        "feat",
        "fix",
        "refactor",
        "docs",
        "style",
        "test",
        "chore",
        "perf",
        "build",
        "ci",
        "revert",
      ],
    ],

    // 한글에는 대소문자 개념이 없으므로 case 검사는 끈다.
    "type-case": [0],
    "subject-case": [0],
  },
};

export default config;
