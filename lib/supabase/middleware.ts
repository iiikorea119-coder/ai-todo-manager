/**
 * 미들웨어용 Supabase 클라이언트
 * Next.js 미들웨어에서 인증 상태를 체크하고 세션을 갱신
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * 미들웨어에서 Supabase 세션을 갱신하고 인증 상태를 체크
 * @param request - Next.js 요청 객체
 * @returns 수정된 응답 객체
 */
export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 세션 갱신 (중요: getUser()가 아닌 getSession()을 사용해서는 안됨)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, user };
};

