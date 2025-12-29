/**
 * 서버 컴포넌트용 Supabase 클라이언트
 * 서버 컴포넌트, API 라우트, Server Actions에서 사용
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * 서버 사이드 Supabase 클라이언트 생성
 * @returns Supabase 클라이언트 인스턴스
 */
export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // 서버 컴포넌트에서는 쿠키 설정이 불가능할 수 있음
            // Server Actions나 Route Handlers에서만 쿠키 설정 가능
          }
        },
      },
    }
  );
};

