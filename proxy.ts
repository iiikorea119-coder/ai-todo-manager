/**
 * Next.js Proxy - 인증 상태 관리
 * 모든 요청에 대해 Supabase 세션을 확인하고 보호된 페이지에 대한 접근 제어
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Proxy 함수 (이전 middleware 함수)
 * 모든 요청을 가로채서 인증 상태를 확인
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 환경 변수 확인
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
                          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 환경 변수가 없으면 에러 (개발 환경에서만)
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase 환경 변수 누락!');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl || '없음');
    console.error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:', supabaseAnonKey || '없음');
    
    // 인증이 필요 없는 페이지는 그대로 통과
    const { pathname } = request.nextUrl;
    if (pathname === '/login' || pathname === '/signup') {
      return response;
    }
    
    // 메인 페이지는 로그인 페이지로 리다이렉트
    if (pathname === '/') {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    return response;
  }

  // Supabase 서버 클라이언트 생성
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // 사용자 세션 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 로그인하지 않은 사용자가 보호된 페이지에 접근 시 로그인 페이지로 리다이렉트
  if (!user && pathname === '/') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 로그인한 사용자가 인증 페이지에 접근 시 메인 페이지로 리다이렉트
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  return response;
}

/**
 * Proxy가 실행될 경로 설정
 * matcher를 사용하여 특정 경로에만 proxy 적용
 */
export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 요청에 대해 proxy 실행:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

