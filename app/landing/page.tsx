/**
 * 메인 랜딩 페이지
 * 서비스를 소개하고 로그인/회원가입으로 유도하는 페이지
 */
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckSquare, Sparkles, BarChart3, Zap } from 'lucide-react';

/**
 * 홈 페이지 컴포넌트
 */
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* 헤더 */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold brand-gradient-text">
              AI 할 일 관리
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">로그인</Button>
            </Link>
            <Link href="/signup">
              <Button>시작하기</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* 히어로 섹션 */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            AI 기반 스마트 관리
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            AI가 도와주는
            <br />
            <span className="brand-gradient-text">
              스마트한 할 일 관리
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            자연어로 입력하면 AI가 자동으로 구조화하고,
            일일/주간 요약으로 생산성을 한눈에 확인하세요.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8">
                무료로 시작하기
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                로그인
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 주요 기능 섹션 */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {/* AI 할 일 생성 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-violet-100 dark:bg-violet-950 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI 자동 생성</h3>
            <p className="text-muted-foreground">
              "내일 오전 10시 팀 회의 준비"라고 입력하면
              AI가 자동으로 제목, 마감일, 우선순위를 설정합니다.
            </p>
          </div>

          {/* 스마트 분석 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">스마트 분석</h3>
            <p className="text-muted-foreground">
              AI가 할 일을 분석하여 일일/주간 요약과
              생산성 인사이트를 제공합니다.
            </p>
          </div>

          {/* 효율적 관리 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">효율적 관리</h3>
            <p className="text-muted-foreground">
              검색, 필터, 정렬 기능으로 원하는 할 일을 빠르게 찾고
              우선순위에 따라 체계적으로 관리하세요.
            </p>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-br from-blue-500 to-violet-500 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            지금 시작하세요
          </h2>
          <p className="text-xl mb-8 opacity-90">
            무료로 시작하고 생산성을 높이세요
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              회원가입하기
            </Button>
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        <p>© 2024 AI 할 일 관리. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;

