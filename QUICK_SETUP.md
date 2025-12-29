# ⚡ 빠른 설정 가이드 (3분 완료)

## 🚨 "데이터베이스 테이블을 생성해주세요" 오류가 나오나요?

다음 단계를 따라 1분 안에 해결하세요!

---

## 📋 1단계: Supabase SQL Editor 열기

1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. 프로젝트 선택: `uyjqbdyrbdsiydyjslus`
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. **New query** 버튼 클릭

---

## 📝 2단계: SQL 코드 복사 & 실행

아래 코드를 **전체 복사**해서 SQL Editor에 붙여넣고 **Run** 클릭!

```sql
-- ✨ AI 할 일 관리 - 테이블 생성
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

-- 🔒 보안 설정 (RLS)
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- 📜 권한 정책
CREATE POLICY "Users can view own todos" ON public.todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own todos" ON public.todos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own todos" ON public.todos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own todos" ON public.todos FOR DELETE USING (auth.uid() = user_id);

-- ✅ 완료!
```

---

## 🎉 3단계: 앱 새로고침

브라우저에서 **F5** 키를 눌러 페이지를 새로고침하세요!

이제 할 일을 추가할 수 있습니다! 🎊

---

## 🆘 문제가 계속되나요?

### 오류 1: "relation already exists"
→ ✅ 이미 테이블이 생성되어 있습니다. 새로고침만 하세요!

### 오류 2: "permission denied"
→ 🔑 Supabase 프로젝트에 접근 권한이 있는지 확인하세요

### 오류 3: 여전히 타임아웃 발생
→ 🌐 네트워크 연결 확인 또는 Supabase 프로젝트가 활성화되어 있는지 확인

---

## 📚 더 자세한 설명

- 전체 스키마: `supabase/schema.sql`
- 간소화 스키마: `supabase/schema-simple.sql`
- 환경 설정: `docs/ENV_SETUP.md`

---

**설정 완료 후 바로 할 일 관리를 시작하세요!** ✨

