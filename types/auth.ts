/**
 * 인증 관련 타입 정의
 */

/**
 * 로그인 요청 데이터
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 회원가입 요청 데이터
 */
export interface SignUpRequest {
  email: string;
  password: string;
  name?: string;
}

/**
 * 사용자 정보
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

/**
 * 인증 에러
 */
export interface AuthError {
  message: string;
  code?: string;
}

