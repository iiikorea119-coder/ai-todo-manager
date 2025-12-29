/**
 * 회원가입 페이지
 * 사용자가 새 계정을 생성할 수 있는 화면
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
import { Checkbox } from '@/components/ui/checkbox';
import { CheckSquare, AlertCircle, Loader2, Check, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/**
 * 회원가입 페이지 컴포넌트
 */
const SignUpPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * 이미 로그인된 사용자 체크 및 환경 변수 확인
   */
  useEffect(() => {
    const initialize = async () => {
      // 환경 변수 확인
      console.log('=== Supabase 환경 변수 확인 ===');
      console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ 설정 안됨');
      console.log('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:', 
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? '✅ 설정됨' : '❌ 설정 안됨'
      );
      console.log('===============================');

      // 이미 로그인된 사용자 체크
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

    initialize();
  }, [router]);

  /**
   * 이메일 유효성 검사
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * 비밀번호 강도 확인
   */
  const getPasswordStrength = (password: string): string => {
    if (password.length === 0) return '';
    if (password.length < 8) return 'weak';
    if (password.length < 12) return 'medium';
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) return 'strong';
    return 'medium';
  };

  const passwordStrength = getPasswordStrength(password);

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

    if (password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      return false;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }

    if (!agreeToTerms) {
      setError('이용약관에 동의해주세요.');
      return false;
    }

    return true;
  };

  /**
   * Supabase 에러 메시지를 한글로 변환
   */
  const getErrorMessage = (error: any): string => {
    const errorMessage = error?.message || '';
    const errorStatus = error?.status;
    
    console.log('🔍 에러 메시지 분석:', { errorMessage, errorStatus });
    
    // 환경 변수 관련 에러
    if (errorMessage.includes('Invalid URL') || errorMessage.includes('supabaseUrl')) {
      return (
        '❌ Supabase URL 설정이 잘못되었습니다.\n\n' +
        '해결 방법: GET_SUPABASE_KEYS.md 파일을 참조하여\n' +
        'Supabase 대시보드에서 올바른 URL과 API 키를 가져오세요.'
      );
    }
    if (
      errorMessage.includes('Invalid API key') || 
      errorMessage.includes('apiKey') ||
      errorMessage.includes('JWT') ||
      errorMessage.includes('Invalid JWT')
    ) {
      return (
        '❌ Supabase API 키가 올바르지 않습니다.\n\n' +
        '해결 방법:\n' +
        '1. https://supabase.com/dashboard 접속\n' +
        '2. Settings → API 메뉴\n' +
        '3. "anon public" 키 복사 (service_role 아님!)\n' +
        '4. .env.local 파일에 키 입력\n' +
        '5. 개발 서버 재시작\n\n' +
        '자세한 가이드: GET_SUPABASE_KEYS.md'
      );
    }
    
    // 이메일 전송 에러
    if (errorMessage.includes('Error sending confirmation email') || errorMessage.includes('sending email')) {
      return (
        '❌ 이메일 확인 메일 전송에 실패했습니다.\n\n' +
        '해결 방법:\n' +
        '1. Supabase 대시보드 접속\n' +
        '2. Authentication → Settings → Email\n' +
        '3. "Enable email confirmations" 토글을 OFF로 설정\n' +
        '4. Save 버튼 클릭\n' +
        '5. 회원가입 재시도\n\n' +
        '이렇게 하면 이메일 확인 없이 즉시 로그인됩니다.'
      );
    }
    
    // 일반적인 Supabase 에러 메시지 처리
    if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
      return '이미 가입된 이메일입니다.';
    }
    if (errorMessage.includes('Invalid email')) {
      return '올바른 이메일 형식이 아닙니다.';
    }
    if (errorMessage.includes('Password should be at least')) {
      return '비밀번호는 최소 6자 이상이어야 합니다.';
    }
    if (errorMessage.includes('weak password')) {
      return '비밀번호가 너무 약합니다. 더 강력한 비밀번호를 사용해주세요.';
    }
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
      return '네트워크 연결을 확인해주세요.';
    }
    if (errorMessage.includes('rate limit')) {
      return '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.';
    }
    
    // 네트워크 에러
    if (errorStatus === 0 || !errorStatus) {
      return (
        'Supabase 서버에 연결할 수 없습니다.\n\n' +
        '확인 사항:\n' +
        '1. 인터넷 연결 확인\n' +
        '2. Supabase URL이 올바른지 확인\n' +
        '3. Supabase API 키가 올바른지 확인\n\n' +
        '자세한 가이드: GET_SUPABASE_KEYS.md'
      );
    }
    
    // 상태 코드별 에러
    if (errorStatus === 400) {
      return '잘못된 요청입니다. 입력 정보를 확인해주세요.';
    }
    if (errorStatus === 401 || errorStatus === 403) {
      return (
        'Supabase 인증에 실패했습니다.\n\n' +
        'API 키가 올바르지 않거나 만료되었을 수 있습니다.\n' +
        'GET_SUPABASE_KEYS.md 파일을 참조하여 키를 다시 설정하세요.'
      );
    }
    if (errorStatus === 422) {
      return '이미 가입된 이메일이거나 유효하지 않은 정보입니다.';
    }
    if (errorStatus >= 500) {
      return 'Supabase 서버 오류입니다. 잠시 후 다시 시도해주세요.';
    }
    
    // 개발 환경에서는 원본 메시지 표시
    if (process.env.NODE_ENV === 'development' && errorMessage) {
      return `[개발 모드]\n\n에러: ${errorMessage}\n\n브라우저 콘솔(F12)에서 자세한 정보를 확인하세요.`;
    }
    
    // 기타 에러
    return '회원가입에 실패했습니다.\n\n브라우저 콘솔(F12)을 확인하거나\nGET_SUPABASE_KEYS.md 파일을 참조하세요.';
  };

  /**
   * 회원가입 제출 핸들러
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    // 환경 변수 확인
    console.log('=== 환경 변수 체크 ===');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    
    console.log('URL:', supabaseUrl || '❌ 없음');
    console.log('KEY:', supabaseKey ? '✅ 있음' : '❌ 없음');
    
    if (!supabaseUrl || !supabaseKey) {
      const missingVars = [];
      if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
      if (!supabaseKey) missingVars.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
      
      setError(
        `Supabase 설정이 필요합니다.\n` +
        `누락된 환경 변수: ${missingVars.join(', ')}\n\n` +
        `프로젝트 루트에 .env.local 파일을 생성하고\n` +
        `환경 변수를 설정한 후 개발 서버를 재시작하세요.`
      );
      console.error('❌ 환경 변수 누락:', missingVars);
      return;
    }
    
    console.log('✅ 환경 변수 확인 완료');

    setIsLoading(true);

    try {
      console.log('=== 회원가입 프로세스 시작 ===');
      console.log('입력 데이터:', { email, name: name || '(없음)' });
      
      const supabase = createClient();
      console.log('✅ Supabase 클라이언트 생성 완료');
      
      // Supabase 회원가입
      console.log('📤 회원가입 요청 전송 중...');
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name.trim() || null,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      console.log('📥 Supabase 응답 수신');
      console.log('응답 데이터:', data);
      console.log('응답 에러:', signUpError);

      // 에러 상세 로그
      if (signUpError) {
        console.error('❌ Supabase 회원가입 에러 발생!');
        console.error('에러 타입:', typeof signUpError);
        console.error('에러 객체:', signUpError);
        console.error('에러 메시지:', signUpError.message);
        console.error('에러 상태:', signUpError.status);
        console.error('에러 이름:', signUpError.name);
        console.error('에러 전체:', JSON.stringify(signUpError, null, 2));
        throw signUpError;
      }

      // 회원가입 성공
      console.log('✅ 회원가입 성공!');
      console.log('사용자 ID:', data.user?.id);
      console.log('세션 존재 여부:', !!data.session);
      console.log('이메일:', data.user?.email);

      // 회원가입 성공 처리
      if (data.user) {
        console.log('✅ 회원가입 성공!');
        console.log('사용자:', data.user.email);
        console.log('세션:', data.session ? '있음' : '없음 (이메일 확인 필요)');
        
        // 이메일 확인이 필요한 경우
        if (!data.session) {
          console.log('📧 이메일 확인 필요');
          setSuccess('회원가입이 완료되었습니다. 이메일을 확인하여 계정을 인증해주세요.');
          
          setTimeout(() => {
            router.push('/login?message=이메일을 확인하여 계정을 인증해주세요.');
          }, 3000);
        } 
        // 즉시 로그인된 경우 (이메일 확인 비활성화됨)
        else {
          console.log('🚀 즉시 로그인 완료');
          setSuccess('회원가입이 완료되었습니다! 잠시 후 메인 페이지로 이동합니다.');
          
          setTimeout(() => {
            router.push('/');
            router.refresh();
          }, 2000);
        }
      } else {
        console.error('⚠️ 예상치 못한 응답: 사용자 데이터 없음');
        setError('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err: any) {
      console.error('=== 회원가입 실패 ===');
      console.error('에러 타입:', typeof err);
      console.error('에러 생성자:', err?.constructor?.name);
      console.error('에러 toString:', err?.toString());
      console.error('에러 message:', err?.message);
      console.error('에러 status:', err?.status);
      console.error('에러 code:', err?.code);
      console.error('에러 name:', err?.name);
      console.error('에러 stack:', err?.stack);
      
      // 에러를 문자열로 변환하여 출력
      try {
        console.error('에러 JSON:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
      } catch (jsonErr) {
        console.error('JSON 변환 실패:', jsonErr);
      }
      
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
              지금 시작하고 생산성을 높이세요
            </p>
          </div>
        </div>

        {/* 회원가입 카드 */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
            <CardDescription>
              몇 가지 정보만 입력하면 시작할 수 있습니다
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
                <Alert className="border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* 이름 입력 (선택) */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  이름 <span className="text-muted-foreground text-sm">(선택)</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="홍길동"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading || !!success}
                  autoComplete="name"
                />
              </div>

              {/* 이메일 입력 */}
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || !!success}
                  autoComplete="email"
                  required
                />
              </div>

              {/* 비밀번호 입력 */}
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="최소 8자 이상"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || !!success}
                  autoComplete="new-password"
                  required
                />
                {/* 비밀번호 강도 표시 */}
                {password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      <div className={`h-1 flex-1 rounded ${passwordStrength === 'weak' ? 'bg-red-500' : passwordStrength === 'medium' ? 'bg-amber-500' : passwordStrength === 'strong' ? 'bg-emerald-500' : 'bg-muted'}`} />
                      <div className={`h-1 flex-1 rounded ${passwordStrength === 'medium' || passwordStrength === 'strong' ? 'bg-amber-500' : 'bg-muted'}`} />
                      <div className={`h-1 flex-1 rounded ${passwordStrength === 'strong' ? 'bg-emerald-500' : 'bg-muted'}`} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {passwordStrength === 'weak' && '약함'}
                      {passwordStrength === 'medium' && '보통'}
                      {passwordStrength === 'strong' && '강함'}
                      {!passwordStrength && ''}
                    </p>
                  </div>
                )}
              </div>

              {/* 비밀번호 확인 */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading || !!success}
                  autoComplete="new-password"
                  required
                />
                {confirmPassword && (
                  <p className={`text-xs ${password === confirmPassword ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {password === confirmPassword ? (
                      <span className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        비밀번호가 일치합니다
                      </span>
                    ) : (
                      '비밀번호가 일치하지 않습니다'
                    )}
                  </p>
                )}
              </div>

              {/* 이용약관 동의 */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  disabled={isLoading || !!success}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    이용약관 및 개인정보처리방침에 동의합니다
                  </label>
                  <p className="text-sm text-muted-foreground">
                    <Link href="/terms" className="underline hover:text-foreground" target="_blank">
                      이용약관
                    </Link>
                    {' '}및{' '}
                    <Link href="/privacy" className="underline hover:text-foreground" target="_blank">
                      개인정보처리방침
                    </Link>
                    을 읽고 동의합니다.
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              {/* 회원가입 버튼 */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !!success}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    가입 중...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    가입 완료
                  </>
                ) : (
                  '회원가입'
                )}
              </Button>

              {/* 로그인 링크 */}
              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  이미 계정이 있으신가요?{' '}
                </span>
                <Link
                  href="/login"
                  className="text-primary font-semibold hover:underline"
                >
                  로그인
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* 서비스 특징 */}
        <div className="text-center space-y-4">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <div className="w-8 h-8 mx-auto bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-muted-foreground">간편한 관리</p>
            </div>
            <div className="space-y-1">
              <div className="w-8 h-8 mx-auto bg-violet-100 dark:bg-violet-950 rounded-full flex items-center justify-center">
                <span className="text-violet-600 dark:text-violet-400 font-bold">AI</span>
              </div>
              <p className="text-muted-foreground">AI 지원</p>
            </div>
            <div className="space-y-1">
              <div className="w-8 h-8 mx-auto bg-emerald-100 dark:bg-emerald-950 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-muted-foreground">무료 시작</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;

