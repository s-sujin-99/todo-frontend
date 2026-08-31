import type { NextConfig } from "next";

// OPEN-01: localStorage 토큰(FR-A05) 기반 인증이라 서버 렌더링이 불필요하고,
// Amplify의 Next.js 16 SSR 지원이 아직 불완전해 정적 export로 확정했다(PRD 16장).
// rewrites·redirects·headers·Proxy·Intercepting Routes는 이 모드에서 쓸 수 없다.
const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
