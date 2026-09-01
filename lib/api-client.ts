// 로컬 백엔드 기본 포트로 폴백한다. 운영 값은 Phase 12에서 Amplify 빌드 환경변수로 주입한다.
// (env 파일은 CLAUDE.md 8장에 따라 어느 저장소에도 커밋하지 않으므로 예시 파일 대신 코드에 기본값을 둔다.)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export const AUTH_TOKEN_KEY = "todo_token";

// FR-A07: 정적 export라 프론트가 백엔드 오리진으로 풀 페이지 이동한다(fetch로 시작할 수 없다).
export function getGoogleLoginUrl(): string {
  return `${API_BASE_URL}/oauth2/authorization/google`;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

// Phase 6의 useAuth가 이 이벤트를 구독해 캐시된 사용자 정보를 지운다(인수 14).
// 리다이렉트·만료 안내는 AuthGuard 한 곳에서만 처리한다 — 여기서 같이 라우팅까지 하면
// AuthGuard의 "미인증이면 /login으로" 이펙트와 경합해 나중에 실행되는 쪽이 쿼리스트링을 지워버린다.
export const AUTH_EXPIRED_EVENT = "todo-auth-expired";

// AuthGuard가 이 플래그로 "방금 401을 받아 로그아웃됐는지"와 "애초에 로그인한 적이 없는지"를 구분한다.
let authExpiredFlag = false;

export function consumeAuthExpiredFlag(): boolean {
  const value = authExpiredFlag;
  authExpiredFlag = false;
  return value;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly errors: string[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ErrorResponseBody {
  code?: string;
  message?: string;
  errors?: string[];
}

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "서버에 연결할 수 없습니다.");
  }

  if (response.status === 401) {
    clearAuthToken();
    if (typeof window !== "undefined") {
      authExpiredFlag = true;
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
  }

  if (!response.ok) {
    const body: ErrorResponseBody | null = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      body?.code ?? "UNKNOWN_ERROR",
      body?.message ?? "요청을 처리하지 못했습니다.",
      body?.errors ?? [],
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

// FR-U08: "무슨 일이 있었는지 + 다음에 무엇을 할지"를 한 문장으로 안내한다.
const ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: "서버에 연결할 수 없습니다. 네트워크 상태를 확인한 뒤 다시 시도해주세요.",
  TODO_NOT_FOUND: "해당 할 일을 찾을 수 없거나 삭제되었습니다. 목록으로 돌아가 다시 확인해주세요.",
  VALIDATION_ERROR: "입력값이 올바르지 않습니다. 표시된 항목을 확인한 뒤 다시 시도해주세요.",
  EMAIL_ALREADY_EXISTS: "이미 가입된 이메일입니다. 로그인을 시도해주세요.",
  INVALID_CREDENTIALS: "이메일 또는 비밀번호가 올바르지 않습니다. 다시 입력해주세요.",
  INVALID_OAUTH_CODE: "구글 로그인 코드가 유효하지 않거나 만료되었습니다. 다시 로그인해주세요.",
  INVALID_RESET_TOKEN: "유효하지 않거나 만료된 링크입니다. 비밀번호 재설정을 다시 요청해주세요.",
};

const DEFAULT_ERROR_MESSAGE = "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";

export function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return ERROR_MESSAGES[error.code] ?? DEFAULT_ERROR_MESSAGE;
  }
  return DEFAULT_ERROR_MESSAGE;
}
