/**
 * 로그인 페이지
 * 사용자가 이메일과 비밀번호로 로그인할 수 있는 화면
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckSquare, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/**
 * 로그인 페이지 컴포넌트
 */
const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * 이미 로그인된 사용자 체크 및 리다이렉트
   */
  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log('✅ 이미 로그인됨, 메인 페이지로 이동');
          router.push('/');
          return;
        }
      } catch (error) {
        console.error('사용자 확인 실패:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkUser();
  }, [router]);

  /**
   * 이메일 유효성 검사
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * 폼 유효성 검사
   */
  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return false;
    }

    if (!validateEmail(email)) {
      setError('올바른 이메일 형식이 아닙니다.');
      return false;
    }

    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return false;
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return false;
    }

    return true;
  };

  /**
   * Supabase 에러 메시지를 한글로 변환
   */
  const getErrorMessage = (error: any): string => {
    const errorMessage = error?.message || '';
    
    console.log('🔍 로그인 에러 분석:', { errorMessage, status: error?.status });
    
    // 잘못된 자격 증명
    if (errorMessage.includes('Invalid login credentials') || errorMessage.includes('invalid_credentials')) {
      return '이메일 또는 비밀번호가 올바르지 않습니다.';
    }
    
    // 이메일 확인 필요
    if (errorMessage.includes('Email not confirmed') || errorMessage.includes('email_not_confirmed')) {
      return '이메일 인증이 필요합니다. 이메일을 확인해주세요.';
    }
    
    // 너무 많은 요청
    if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
      return '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
    }
    
    // 네트워크 에러
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
      return '네트워크 연결을 확인해주세요.';
    }
    
    // 사용자를 찾을 수 없음
    if (errorMessage.includes('User not found') || errorMessage.includes('user_not_found')) {
      return '등록되지 않은 이메일입니다. 회원가입을 진행해주세요.';
    }
    
    // 기본 에러 메시지
    return '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.';
  };

  /**
   * 로그인 제출 핸들러
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    console.log('=== 로그인 프로세스 시작 ===');
    console.log('이메일:', email);

    setIsLoading(true);

    try {
      const supabase = createClient();
      console.log('✅ Supabase 클라이언트 생성 완료');

      // Supabase 로그인
      console.log('📤 로그인 요청 전송 중...');
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      console.log('📥 Supabase 응답 수신');
      console.log('응답 데이터:', data);
      console.log('응답 에러:', signInError);

      // 에러 처리
      if (signInError) {
        console.error('❌ Supabase 로그인 에러 발생!');
        console.error('에러 메시지:', signInError.message);
        console.error('에러 상태:', signInError.status);
        throw signInError;
      }

      // 로그인 성공
      if (data.session && data.user) {
        console.log('✅ 로그인 성공!');
        console.log('사용자 ID:', data.user.id);
        console.log('사용자 이메일:', data.user.email);
        
        setSuccess('로그인 성공! 메인 페이지로 이동합니다...');
        
        // 1초 후 메인 페이지로 이동
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1000);
      } else {
        console.error('⚠️ 예상치 못한 응답: 세션 또는 사용자 데이터 없음');
        setError('로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err: any) {
      console.error('=== 로그인 실패 ===');
      console.error('에러:', err);
      console.error('에러 메시지:', err?.message);
      console.error('에러 상태:', err?.status);
      
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 인증 확인 중 로딩 표시
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-violet-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-violet-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* 로고 및 서비스 소개 */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg">
              <CheckSquare className="w-10 h-10 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold brand-gradient-text">
              AI 할 일 관리
            </h1>
            <p className="text-muted-foreground mt-2">
              AI가 도와주는 스마트한 할 일 관리
            </p>
          </div>
        </div>

        {/* 로그인 카드 */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">로그인</CardTitle>
            <CardDescription>
              이메일과 비밀번호로 로그인하세요
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* 에러 메시지 */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* 성공 메시지 */}
              {success && (
                <Alert className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* 이메일 입력 */}
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
              </div>

              {/* 비밀번호 입력 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">비밀번호</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                    tabIndex={-1}
                  >
                    비밀번호 찾기
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              {/* 로그인 버튼 */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !!success}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    로그인 중...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    로그인 성공
                  </>
                ) : (
                  '로그인'
                )}
              </Button>

              {/* 구분선 */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    또는
                  </span>
                </div>
              </div>

              {/* 회원가입 링크 */}
              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  아직 계정이 없으신가요?{' '}
                </span>
                <Link
                  href="/signup"
                  className="text-primary font-semibold hover:underline"
                >
                  회원가입
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* 푸터 정보 */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            로그인하면{' '}
            <Link href="/terms" className="underline hover:text-foreground">
              이용약관
            </Link>
            과{' '}
            <Link href="/privacy" className="underline hover:text-foreground">
              개인정보처리방침
            </Link>
            에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

