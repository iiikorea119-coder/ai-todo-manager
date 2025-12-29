-- =====================================================
-- AI 할 일 관리 - 간소화된 스키마 (users 테이블 없이)
-- =====================================================
-- 
-- 이 스키마는 todos 테이블만 생성하며, auth.users를 직접 참조합니다.
-- 
-- 실행 방법:
-- 1. Supabase 대시보드 > SQL Editor
-- 2. 이 파일 내용 붙여넣기
-- 3. RUN 클릭
-- 
-- =====================================================

-- =====================================================
-- 1. TODOS 테이블 생성
-- =====================================================

CREATE TABLE IF NOT EXISTS public.todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium' NOT NULL,
  category TEXT[] DEFAULT '{}',
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 2. 인덱스 생성
-- =====================================================

CREATE INDEX IF NOT EXISTS todos_user_id_idx ON public.todos(user_id);
CREATE INDEX IF NOT EXISTS todos_completed_idx ON public.todos(completed);
CREATE INDEX IF NOT EXISTS todos_due_date_idx ON public.todos(due_date);
CREATE INDEX IF NOT EXISTS todos_priority_idx ON public.todos(priority);
CREATE INDEX IF NOT EXISTS todos_created_date_idx ON public.todos(created_date DESC);
CREATE INDEX IF NOT EXISTS todos_user_completed_idx ON public.todos(user_id, completed);

-- =====================================================
-- 3. updated_at 자동 업데이트 트리거
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_todos_updated_at ON public.todos;
CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON public.todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) 활성화
-- =====================================================

ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. RLS 정책
-- =====================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can create own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can update own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can delete own todos" ON public.todos;

-- 자신의 할 일만 조회 가능
CREATE POLICY "Users can view own todos"
  ON public.todos FOR SELECT
  USING (auth.uid() = user_id);

-- 자신의 할 일만 생성 가능
CREATE POLICY "Users can create own todos"
  ON public.todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 자신의 할 일만 수정 가능
CREATE POLICY "Users can update own todos"
  ON public.todos FOR UPDATE
  USING (auth.uid() = user_id);

-- 자신의 할 일만 삭제 가능
CREATE POLICY "Users can delete own todos"
  ON public.todos FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 완료!
-- =====================================================

