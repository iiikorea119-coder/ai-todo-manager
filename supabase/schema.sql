-- =====================================================
-- AI 할 일 관리 서비스 - Supabase 데이터베이스 스키마
-- =====================================================
-- 
-- 이 파일은 Supabase SQL Editor에서 바로 실행 가능합니다.
-- 
-- 실행 순서:
-- 1. Supabase 대시보드 접속
-- 2. SQL Editor 열기
-- 3. 이 파일의 내용을 복사하여 붙여넣기
-- 4. RUN 버튼 클릭
-- 
-- =====================================================

-- =====================================================
-- 1. USERS 테이블 (프로필)
-- =====================================================
-- auth.users와 1:1로 연결되는 사용자 프로필 테이블

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- users 테이블 코멘트
COMMENT ON TABLE public.users IS '사용자 프로필 테이블 (auth.users와 1:1 연결)';
COMMENT ON COLUMN public.users.id IS 'auth.users의 id와 동일';
COMMENT ON COLUMN public.users.email IS '사용자 이메일';
COMMENT ON COLUMN public.users.name IS '사용자 이름';
COMMENT ON COLUMN public.users.avatar_url IS '프로필 이미지 URL';

-- =====================================================
-- 2. TODOS 테이블 (할 일)
-- =====================================================
-- 각 사용자별 할 일을 관리하는 테이블

CREATE TABLE IF NOT EXISTS public.todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
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

-- todos 테이블 코멘트
COMMENT ON TABLE public.todos IS '할 일 목록 테이블';
COMMENT ON COLUMN public.todos.id IS '할 일 고유 ID';
COMMENT ON COLUMN public.todos.user_id IS '소유자 사용자 ID';
COMMENT ON COLUMN public.todos.title IS '할 일 제목';
COMMENT ON COLUMN public.todos.description IS '할 일 상세 설명';
COMMENT ON COLUMN public.todos.created_date IS '할 일 생성일';
COMMENT ON COLUMN public.todos.due_date IS '할 일 마감일';
COMMENT ON COLUMN public.todos.priority IS '우선순위 (high, medium, low)';
COMMENT ON COLUMN public.todos.category IS '카테고리 배열 (업무, 개인, 학습 등)';
COMMENT ON COLUMN public.todos.completed IS '완료 여부';

-- =====================================================
-- 3. 인덱스 생성
-- =====================================================
-- 쿼리 성능 최적화를 위한 인덱스

-- users 테이블 인덱스
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);

-- todos 테이블 인덱스
CREATE INDEX IF NOT EXISTS todos_user_id_idx ON public.todos(user_id);
CREATE INDEX IF NOT EXISTS todos_completed_idx ON public.todos(completed);
CREATE INDEX IF NOT EXISTS todos_due_date_idx ON public.todos(due_date);
CREATE INDEX IF NOT EXISTS todos_priority_idx ON public.todos(priority);
CREATE INDEX IF NOT EXISTS todos_created_date_idx ON public.todos(created_date DESC);

-- 복합 인덱스 (자주 사용되는 쿼리 조합)
CREATE INDEX IF NOT EXISTS todos_user_completed_idx ON public.todos(user_id, completed);
CREATE INDEX IF NOT EXISTS todos_user_priority_idx ON public.todos(user_id, priority);

-- =====================================================
-- 4. 트리거 함수
-- =====================================================
-- updated_at 컬럼을 자동으로 업데이트하는 함수

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. 트리거 적용
-- =====================================================

-- users 테이블 updated_at 트리거
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- todos 테이블 updated_at 트리거
DROP TRIGGER IF EXISTS update_todos_updated_at ON public.todos;
CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON public.todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) 활성화
-- =====================================================

-- users 테이블 RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- todos 테이블 RLS 활성화
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. RLS 정책 - USERS 테이블
-- =====================================================

-- 기존 정책 삭제 (재실행 시 충돌 방지)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- 자신의 프로필만 조회 가능
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- 자신의 프로필만 수정 가능
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- 회원가입 시 자신의 프로필 생성 가능
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- 8. RLS 정책 - TODOS 테이블
-- =====================================================

-- 기존 정책 삭제 (재실행 시 충돌 방지)
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
-- 9. 회원가입 시 사용자 프로필 자동 생성
-- =====================================================
-- auth.users에 새 사용자가 추가되면 자동으로 public.users에 프로필 생성

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기존 트리거 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 트리거 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 10. 샘플 데이터 (선택사항)
-- =====================================================
-- 개발 및 테스트용 샘플 데이터
-- 프로덕션에서는 이 섹션을 주석 처리하거나 삭제하세요

-- 주석: 실제 사용자는 회원가입을 통해 생성됩니다
-- 샘플 데이터는 사용자가 직접 회원가입 후 할 일을 추가하세요

-- =====================================================
-- 11. 유용한 뷰 (선택사항)
-- =====================================================

-- 사용자별 할 일 통계 뷰
CREATE OR REPLACE VIEW public.user_todo_stats AS
SELECT 
  u.id AS user_id,
  u.email,
  u.name,
  COUNT(t.id) AS total_todos,
  COUNT(CASE WHEN t.completed THEN 1 END) AS completed_todos,
  COUNT(CASE WHEN NOT t.completed THEN 1 END) AS pending_todos,
  COUNT(CASE WHEN NOT t.completed AND t.due_date < NOW() THEN 1 END) AS overdue_todos
FROM public.users u
LEFT JOIN public.todos t ON u.id = t.user_id
GROUP BY u.id, u.email, u.name;

-- 뷰 코멘트
COMMENT ON VIEW public.user_todo_stats IS '사용자별 할 일 통계 (전체, 완료, 진행 중, 지연)';

-- =====================================================
-- 12. 헬퍼 함수 (선택사항)
-- =====================================================

-- 지연된 할 일 개수를 반환하는 함수
CREATE OR REPLACE FUNCTION public.get_overdue_todos_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.todos
    WHERE user_id = p_user_id
      AND completed = FALSE
      AND due_date < NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 오늘 마감인 할 일을 반환하는 함수
CREATE OR REPLACE FUNCTION public.get_today_due_todos(p_user_id UUID)
RETURNS SETOF public.todos AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.todos
  WHERE user_id = p_user_id
    AND completed = FALSE
    AND DATE(due_date) = CURRENT_DATE
  ORDER BY priority DESC, due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 완료!
-- =====================================================
-- 
-- 스키마가 성공적으로 생성되었습니다.
-- 
-- 다음 단계:
-- 1. Supabase 대시보드에서 테이블이 생성되었는지 확인
-- 2. Table Editor에서 users와 todos 테이블 확인
-- 3. RLS 정책이 활성화되었는지 확인
-- 4. 애플리케이션에서 회원가입 후 테스트
-- 
-- =====================================================

