/**
 * 할 일 관리 메인 페이지
 * 사용자의 할 일 목록을 관리하는 대시보드
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CheckSquare, LogOut, Plus, Sparkles, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TodoList, TodoForm, TodoAnalysis } from '@/components/todo';
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '@/types/todo';
import { createClient } from '@/lib/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from 'sonner';

/**
 * 메인 대시보드 페이지 컴포넌트
 */
const HomePage = () => {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isTodosLoading, setIsTodosLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  /**
   * Supabase에서 할 일 목록 가져오기
   */
  const fetchTodos = useCallback(async (userId: string) => {
    console.log('📥 할 일 목록 조회 시작, user_id:', userId);
    try {
      setIsTodosLoading(true);
      const supabase = createClient();
      
      console.log('🔄 Supabase 쿼리 실행 중...');
      
      // 타임아웃 설정 (3초로 단축)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout after 3 seconds')), 3000);
      });
      
      const queryPromise = supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('created_date', { ascending: false });
      
      const { data, error } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]) as any;

      console.log('📦 Supabase 응답:', { data, error });

      if (error) {
        console.error('❌ 할 일 조회 실패:', error);
        console.error('에러 세부정보:', error.message, error.code, error.hint);
        
        // 테이블이 없는 경우
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.error('⚠️ todos 테이블이 존재하지 않습니다!');
          toast.error('📋 데이터베이스 테이블을 생성해주세요.', {
            description: 'Supabase 대시보드 → SQL Editor에서 schema-simple.sql 실행',
            duration: 5000,
          });
        } 
        // RLS 정책 문제
        else if (error.code === '42501' || error.message.includes('permission')) {
          console.error('⚠️ RLS 권한 문제!');
          toast.error('🔒 권한이 없습니다.', {
            description: 'RLS 정책을 확인하세요.',
            duration: 5000,
          });
        }
        else {
          toast.error('할 일 목록 로드 실패', {
            description: error.message,
            duration: 3000,
          });
        }
        
        // 에러가 발생해도 빈 배열로 설정
        setTodos([]);
        return;
      }

      console.log('✅ 할 일 목록 조회 성공:', data?.length, '개');
      setTodos(data || []);
    } catch (error: any) {
      console.error('❌ 할 일 조회 예외:', error);
      
      if (error.message?.includes('timeout')) {
        console.error('⏱️ 타임아웃 발생! 테이블이 없거나 연결 문제');
        toast.error('⏱️ 데이터베이스 테이블을 생성해주세요', {
          description: 'Supabase 대시보드에서 schema-simple.sql 실행',
          duration: 5000,
        });
      } else {
        toast.error('네트워크 오류', {
          description: error.message,
          duration: 3000,
        });
      }
      
      // 예외가 발생해도 빈 배열로 설정
      setTodos([]);
    } finally {
      console.log('✅ 할 일 조회 완료, 로딩 상태 해제');
      setIsTodosLoading(false);
    }
  }, []);

  /**
   * 사용자 세션 확인 및 실시간 상태 변화 감지
   */
  useEffect(() => {
    console.log('🚀 useEffect 시작 - 인증 확인 및 구독 설정');
    const supabase = createClient();
    let isMounted = true;
    let initialized = false;

    // 실시간 인증 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 인증 상태 변화 이벤트:', event, '세션:', session?.user?.email);
        
        if (!isMounted) {
          console.log('⚠️ 컴포넌트 언마운트됨, 이벤트 무시');
          return;
        }
        
        // 초기 세션 확인 (INITIAL_SESSION 또는 SIGNED_IN)
        if (event === 'INITIAL_SESSION' || (event === 'SIGNED_IN' && !initialized)) {
          initialized = true;
          
          if (session?.user) {
            console.log('✅ 사용자 세션 확인:', session.user.email);
            console.log('📌 user.id:', session.user.id);
            setUser(session.user);
            
            // 🚀 화면 먼저 표시 (즉시 로딩 완료)
            console.log('⚡ 화면 즉시 표시 - isLoading을 false로 설정');
            setIsLoading(false);
            
            // 백그라운드에서 할 일 목록 가져오기
            console.log('🎯 할 일 목록 백그라운드 조회 시작...');
            fetchTodos(session.user.id).then(() => {
              console.log('🎯 할 일 목록 조회 완료');
            }).catch((err) => {
              console.error('할 일 조회 중 에러:', err);
            });
          } else {
            console.log('❌ 로그인되지 않음, 로그인 페이지로 이동');
            setIsLoading(false);
            router.push('/login');
          }
        } 
        else if (event === 'SIGNED_OUT') {
          console.log('❌ 로그아웃됨');
          setUser(null);
          setTodos([]);
          setIsLoading(false);
        } 
        else if (event === 'SIGNED_IN' && initialized) {
          console.log('✅ 재로그인:', session?.user?.email);
          if (session?.user) {
            setUser(session.user);
            fetchTodos(session.user.id);
          }
        } 
        else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('🔄 토큰 갱신됨');
          setUser(session.user);
        } 
        else if (event === 'USER_UPDATED' && session?.user) {
          console.log('👤 사용자 정보 업데이트됨');
          setUser(session.user);
        }
      }
    );

    console.log('✅ onAuthStateChange 구독 설정 완료');

    // 클린업: 컴포넌트 언마운트 시 구독 해제
    return () => {
      console.log('🧹 useEffect 클린업 - 구독 해제');
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router, fetchTodos]);

  /**
   * 할 일 추가/수정 핸들러
   */
  const handleSaveTodo = async (data: CreateTodoRequest) => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      setIsFormSubmitting(true);
      const supabase = createClient();

      if (editingTodo) {
        // 수정 모드
        console.log('📝 할 일 수정 시작:', editingTodo.id);
        
        const updateData: UpdateTodoRequest = {
          title: data.title,
          description: data.description,
          priority: data.priority,
          category: data.category,
          due_date: data.due_date || null,
        };

        const { error } = await supabase
          .from('todos')
          .update(updateData)
          .eq('id', editingTodo.id)
          .eq('user_id', user.id); // 본인 소유만 수정 가능

        if (error) {
          console.error('할 일 수정 실패:', error);
          toast.error('할 일 수정에 실패했습니다.');
          return;
        }

        console.log('✅ 할 일 수정 성공');
        toast.success('할 일이 수정되었습니다.');
      } else {
        // 생성 모드
        console.log('➕ 할 일 생성 시작');
        
        const newTodo = {
          user_id: user.id,
          title: data.title,
          description: data.description,
          priority: data.priority,
          category: data.category,
          due_date: data.due_date || null,
          completed: false,
        };

        const { error } = await supabase
          .from('todos')
          .insert([newTodo]);

        if (error) {
          console.error('할 일 생성 실패:', error);
          toast.error('할 일 추가에 실패했습니다.');
          return;
        }

        console.log('✅ 할 일 생성 성공');
        toast.success('할 일이 추가되었습니다.');
      }

      // 목록 새로고침
      await fetchTodos(user.id);
      setIsFormOpen(false);
      setEditingTodo(null);
    } catch (error) {
      console.error('할 일 저장 에러:', error);
      toast.error('네트워크 오류가 발생했습니다.');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  /**
   * 할 일 완료 상태 토글
   */
  const handleToggleComplete = async (id: string, completed: boolean) => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      const supabase = createClient();
      
      console.log('🔄 완료 상태 토글:', id, '→', completed);

      const { error } = await supabase
        .from('todos')
        .update({ completed })
        .eq('id', id)
        .eq('user_id', user.id); // 본인 소유만 수정 가능

      if (error) {
        console.error('완료 상태 변경 실패:', error);
        toast.error('완료 상태 변경에 실패했습니다.');
        return;
      }

      console.log('✅ 완료 상태 변경 성공');
      
      // 로컬 상태 즉시 업데이트 (UI 반응성 향상)
      setTodos(
        todos.map((todo) => (todo.id === id ? { ...todo, completed } : todo))
      );
      
      toast.success(completed ? '할 일을 완료했습니다!' : '할 일을 미완료로 변경했습니다.');
    } catch (error) {
      console.error('완료 상태 변경 에러:', error);
      toast.error('네트워크 오류가 발생했습니다.');
    }
  };

  /**
   * 할 일 수정 핸들러
   */
  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setIsFormOpen(true);
  };

  /**
   * 할 일 삭제 핸들러
   */
  const handleDelete = async (id: string) => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      const supabase = createClient();
      
      console.log('🗑️ 할 일 삭제 시작:', id);

      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // 본인 소유만 삭제 가능

      if (error) {
        console.error('할 일 삭제 실패:', error);
        toast.error('할 일 삭제에 실패했습니다.');
        return;
      }

      console.log('✅ 할 일 삭제 성공');
      toast.success('할 일이 삭제되었습니다.');

      // 로컬 상태에서 즉시 제거 (UI 반응성 향상)
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error('할 일 삭제 에러:', error);
      toast.error('네트워크 오류가 발생했습니다.');
    }
  };

  /**
   * 로그아웃 핸들러
   */
  const handleLogout = async () => {
    try {
      console.log('=== 로그아웃 시작 ===');
      const supabase = createClient();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ 로그아웃 실패:', error);
        alert('로그아웃에 실패했습니다. 다시 시도해주세요.');
        return;
      }
      
      console.log('✅ 로그아웃 성공');
      
      // 전체 페이지 새로고침으로 로그인 페이지로 이동
      // window.location.href를 사용하여 middleware가 새로운 세션 상태를 확인하도록 함
      window.location.href = '/login';
    } catch (error) {
      console.error('로그아웃 에러:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  /**
   * 통계 계산
   */
  const totalTodos = todos.length;
  const completedTodos = todos.filter((t) => t.completed).length;
  const pendingTodos = totalTodos - completedTodos;

  // 로그인하지 않은 경우 (리다이렉트 전에 표시되지 않도록)
  // isLoading과 user가 모두 없을 때만 로딩 표시
  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  // 사용자 없으면 null 반환 (middleware가 리다이렉트 처리)
  if (!user) {
    return null;
  }

  // 사용자 정보
  const userName = user.user_metadata?.name || user.email?.split('@')[0] || '사용자';
  const userEmail = user.email || '';
  const userAvatar = user.user_metadata?.avatar_url || '';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* 로고 */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold brand-gradient-text hidden sm:inline">
              AI 할 일 관리
            </span>
          </div>

          {/* 우측 메뉴 */}
          <div className="flex items-center gap-4">
            {/* AI 요약 버튼 */}
            <Button variant="outline" size="sm" className="gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">AI 요약</span>
            </Button>

            {/* 사용자 메뉴 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {userName[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {userEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>프로필</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[350px_1fr]">
          {/* 좌측: 통계 및 추가 버튼 */}
          <aside className="space-y-6">
            {/* 통계 카드 */}
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">통계</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">전체</span>
                  <span className="text-2xl font-bold">{totalTodos}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">진행 중</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {pendingTodos}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">완료</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {completedTodos}
                  </span>
                </div>
              </div>
            </div>

            {/* 할 일 추가 버튼 */}
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={() => {
                setEditingTodo(null);
                setIsFormOpen(true);
              }}
            >
              <Plus className="w-5 h-5" />
              새 할 일 추가
            </Button>

            {/* 빠른 액션 */}
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-sm font-semibold mb-3">빠른 액션</h3>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  size="sm"
                >
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  AI로 할 일 생성
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  size="sm"
                >
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  주간 요약 보기
                </Button>
              </div>
            </div>
          </aside>

          {/* 우측: 할 일 목록 */}
          <div className="space-y-6">
            {/* 페이지 제목 */}
            <div>
              <h1 className="text-3xl font-bold mb-2">내 할 일</h1>
              <p className="text-muted-foreground">
                할 일을 관리하고 생산성을 높이세요
              </p>
            </div>

            {/* AI 요약 및 분석 */}
            <TodoAnalysis todos={todos} />

            {/* TodoList 컴포넌트 */}
            <TodoList
              todos={todos}
              isLoading={isTodosLoading}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </main>

      {/* TodoForm 다이얼로그 */}
      <TodoForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTodo(null);
        }}
        onSubmit={handleSaveTodo}
        editTodo={editingTodo}
        isLoading={isFormSubmitting}
      />
    </div>
  );
};

export default HomePage;
