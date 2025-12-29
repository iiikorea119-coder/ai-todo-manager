# Supabase 설정 가이드

AI 할 일 관리 프로젝트의 Supabase 초기 설정 가이드입니다.

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 웹사이트 방문
2. "Start your project" 클릭
3. 새 프로젝트 생성:
   - Project Name: `ai-todo-manager`
   - Database Password: 안전한 비밀번호 생성
   - Region: `Northeast Asia (Seoul)` 선택 (한국 사용자용)
   - Plan: Free 선택

## 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가:

```env
# Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_URL=your-project-url

# Supabase Anon/Public Key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### 환경 변수 값 찾기

1. Supabase 대시보드에서 프로젝트 선택
2. 왼쪽 메뉴에서 **Settings** 클릭
3. **API** 메뉴 클릭
4. **Project URL**과 **anon public** 키 복사

## 3. 데이터베이스 스키마 생성

Supabase SQL Editor에서 다음 SQL을 실행:

```sql
-- todos 테이블 생성
CREATE TABLE IF NOT EXISTS public.todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS todos_user_id_idx ON public.todos(user_id);
CREATE INDEX IF NOT EXISTS todos_completed_idx ON public.todos(completed);
CREATE INDEX IF NOT EXISTS todos_due_date_idx ON public.todos(due_date);
CREATE INDEX IF NOT EXISTS todos_priority_idx ON public.todos(priority);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거
DROP TRIGGER IF EXISTS update_todos_updated_at ON public.todos;
CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON public.todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) 활성화
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 자신의 데이터만 조회 가능
CREATE POLICY "Users can view own todos"
  ON public.todos FOR SELECT
  USING (auth.uid() = user_id);

-- RLS 정책: 자신의 데이터만 생성 가능
CREATE POLICY "Users can create own todos"
  ON public.todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS 정책: 자신의 데이터만 수정 가능
CREATE POLICY "Users can update own todos"
  ON public.todos FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS 정책: 자신의 데이터만 삭제 가능
CREATE POLICY "Users can delete own todos"
  ON public.todos FOR DELETE
  USING (auth.uid() = user_id);
```

## 4. 인증 설정

### 이메일 인증 활성화

1. Supabase 대시보드에서 **Authentication** → **Providers** 선택
2. **Email** 활성화
3. **Enable email confirmations** 체크 (선택사항)

### 소셜 로그인 (선택사항)

1. **Authentication** → **Providers** 선택
2. Google, GitHub 등 원하는 provider 활성화
3. 각 provider의 Client ID와 Secret 입력

## 5. 타입 생성 (선택사항)

Supabase CLI를 사용하여 TypeScript 타입 자동 생성:

```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# 타입 생성
supabase gen types typescript --project-id your-project-id > lib/supabase/types.ts
```

또는 수동으로 `lib/supabase/types.ts` 파일 수정

## 6. 미들웨어 활성화 (선택사항)

인증이 필요한 페이지를 보호하려면:

```bash
# 예제 파일을 실제 파일로 복사
cp middleware.ts.example middleware.ts
```

## 7. 테스트

### 회원가입 테스트

1. 브라우저에서 `http://localhost:3000/signup` 접속
2. 이메일과 비밀번호 입력
3. 회원가입 버튼 클릭
4. Supabase 대시보드의 **Authentication** → **Users**에서 사용자 확인

### 로그인 테스트

1. `http://localhost:3000/login` 접속
2. 가입한 이메일과 비밀번호 입력
3. 로그인 버튼 클릭
4. 메인 페이지로 리다이렉트 확인

### 데이터 테스트

1. 로그인 후 할 일 추가
2. Supabase 대시보드의 **Table Editor** → **todos**에서 데이터 확인

## 8. 보안 체크리스트

- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] RLS (Row Level Security)가 활성화되어 있는지 확인
- [ ] 프로덕션 환경 변수가 안전하게 관리되는지 확인
- [ ] Service Role Key가 클라이언트에 노출되지 않는지 확인

## 9. 문제 해결

### "Invalid API key" 오류

- `.env.local` 파일의 환경 변수가 정확한지 확인
- 개발 서버 재시작: `npm run dev`

### "Row Level Security" 오류

- RLS 정책이 올바르게 설정되었는지 확인
- `auth.uid()`가 현재 사용자의 ID와 일치하는지 확인

### CORS 오류

- Supabase 대시보드의 **Settings** → **API** → **CORS**에서
- 개발 서버 URL 추가: `http://localhost:3000`

## 10. 유용한 링크

- [Supabase 공식 문서](https://supabase.com/docs)
- [Next.js + Supabase 가이드](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Auth 문서](https://supabase.com/docs/guides/auth)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)

## 11. 다음 단계

- [ ] 인증 로직을 실제 페이지에 통합
- [ ] 할 일 CRUD 작업에 Supabase 연동
- [ ] 실시간 구독 기능 추가
- [ ] 프로필 관리 기능 추가
- [ ] 이메일 템플릿 커스터마이징

