# Supabase 데이터베이스 스키마

AI 할 일 관리 서비스의 Supabase 데이터베이스 스키마입니다.

## 📁 파일 구조

```
supabase/
├── schema.sql      # 바로 실행 가능한 SQL 스키마
└── README.md       # 사용 가이드 (이 파일)
```

## 🚀 빠른 시작

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 접속
2. 새 프로젝트 생성
3. 프로젝트 설정 완료 대기

### 2. SQL 스키마 실행

1. Supabase 대시보드 접속
2. 왼쪽 메뉴에서 **SQL Editor** 선택
3. **New query** 버튼 클릭
4. `supabase/schema.sql` 파일의 내용을 복사하여 붙여넣기
5. **RUN** 버튼 클릭
6. 성공 메시지 확인

### 3. 테이블 확인

1. 왼쪽 메뉴에서 **Table Editor** 선택
2. `users`와 `todos` 테이블이 생성되었는지 확인

## 📊 데이터베이스 구조

### ERD (Entity Relationship Diagram)

```
┌─────────────────┐          ┌─────────────────┐
│   auth.users    │          │  public.users   │
│  (Supabase)     │◄─────────│   (Profile)     │
├─────────────────┤   1:1    ├─────────────────┤
│ id (PK)         │          │ id (PK, FK)     │
│ email           │          │ email           │
│ ...             │          │ name            │
└─────────────────┘          │ avatar_url      │
                             └────────┬────────┘
                                      │ 1:N
                                      │
                             ┌────────▼────────┐
                             │  public.todos   │
                             ├─────────────────┤
                             │ id (PK)         │
                             │ user_id (FK)    │
                             │ title           │
                             │ description     │
                             │ created_date    │
                             │ due_date        │
                             │ priority        │
                             │ category[]      │
                             │ completed       │
                             └─────────────────┘
```

### 테이블 상세

#### 1. `public.users` (사용자 프로필)

| 컬럼명 | 타입 | 설명 | 제약 조건 |
|--------|------|------|-----------|
| id | UUID | 사용자 ID | PK, FK → auth.users(id) |
| email | TEXT | 이메일 | NOT NULL, UNIQUE |
| name | TEXT | 이름 | - |
| avatar_url | TEXT | 프로필 이미지 URL | - |
| created_at | TIMESTAMPTZ | 생성일 | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | 수정일 | DEFAULT NOW() |

#### 2. `public.todos` (할 일)

| 컬럼명 | 타입 | 설명 | 제약 조건 |
|--------|------|------|-----------|
| id | UUID | 할 일 ID | PK, DEFAULT gen_random_uuid() |
| user_id | UUID | 소유자 ID | FK → users(id), NOT NULL |
| title | TEXT | 제목 | NOT NULL |
| description | TEXT | 설명 | DEFAULT '' |
| created_date | TIMESTAMPTZ | 생성일 | DEFAULT NOW() |
| due_date | TIMESTAMPTZ | 마감일 | - |
| priority | TEXT | 우선순위 | CHECK (high/medium/low) |
| category | TEXT[] | 카테고리 | DEFAULT '{}' |
| completed | BOOLEAN | 완료 여부 | DEFAULT FALSE |
| created_at | TIMESTAMPTZ | 생성일 | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | 수정일 | DEFAULT NOW() |

## 🔐 보안 (Row Level Security)

### RLS 정책

모든 테이블에 RLS가 활성화되어 있으며, **소유자만 자신의 데이터를 읽고 쓸 수 있습니다**.

#### `public.users` 정책

- ✅ **SELECT**: 자신의 프로필만 조회 가능
- ✅ **INSERT**: 회원가입 시 자신의 프로필 생성 가능
- ✅ **UPDATE**: 자신의 프로필만 수정 가능
- ❌ **DELETE**: 불가능 (CASCADE로 auth.users 삭제 시 자동 삭제)

#### `public.todos` 정책

- ✅ **SELECT**: 자신의 할 일만 조회 가능
- ✅ **INSERT**: 자신의 할 일만 생성 가능
- ✅ **UPDATE**: 자신의 할 일만 수정 가능
- ✅ **DELETE**: 자신의 할 일만 삭제 가능

### 보안 검증

```sql
-- 다른 사용자의 데이터는 조회 불가능
SELECT * FROM public.todos WHERE user_id != auth.uid();
-- 결과: 0 rows (RLS로 차단됨)

-- 자신의 데이터만 조회 가능
SELECT * FROM public.todos WHERE user_id = auth.uid();
-- 결과: 자신의 할 일 목록
```

## 🔄 자동화 기능

### 1. 프로필 자동 생성

회원가입 시 `auth.users`에 사용자가 추가되면 자동으로 `public.users`에 프로필 생성

```sql
-- 트리거: on_auth_user_created
-- 함수: handle_new_user()
```

### 2. updated_at 자동 업데이트

레코드가 수정되면 자동으로 `updated_at` 필드 업데이트

```sql
-- 트리거: update_users_updated_at, update_todos_updated_at
-- 함수: update_updated_at_column()
```

## 📊 인덱스

쿼리 성능 최적화를 위한 인덱스가 자동으로 생성됩니다:

### `public.users` 인덱스
- `users_email_idx` - 이메일 검색

### `public.todos` 인덱스
- `todos_user_id_idx` - 사용자별 할 일 조회
- `todos_completed_idx` - 완료 상태별 필터링
- `todos_due_date_idx` - 마감일순 정렬
- `todos_priority_idx` - 우선순위별 필터링
- `todos_created_date_idx` - 생성일순 정렬
- `todos_user_completed_idx` - 복합 인덱스 (사용자 + 완료 상태)
- `todos_user_priority_idx` - 복합 인덱스 (사용자 + 우선순위)

## 🔍 유용한 뷰 및 함수

### 1. 사용자 통계 뷰

```sql
-- 뷰: user_todo_stats
SELECT * FROM public.user_todo_stats;
```

결과 예시:
| user_id | email | total_todos | completed_todos | pending_todos | overdue_todos |
|---------|-------|-------------|-----------------|---------------|---------------|
| uuid... | user@example.com | 10 | 7 | 3 | 1 |

### 2. 헬퍼 함수

#### 지연된 할 일 개수
```sql
SELECT public.get_overdue_todos_count(auth.uid());
```

#### 오늘 마감인 할 일
```sql
SELECT * FROM public.get_today_due_todos(auth.uid());
```

## 📝 사용 예시

### TypeScript (Next.js)

```typescript
import { createClient } from '@/lib/supabase/server';

// 할 일 목록 조회
const getTodos = async () => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_date', { ascending: false });
  
  return data;
};

// 할 일 생성
const createTodo = async (title: string) => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('todos')
    .insert([{
      user_id: user.id,
      title,
      priority: 'medium',
    }])
    .select()
    .single();
  
  return data;
};

// 할 일 완료 토글
const toggleTodo = async (id: string, completed: boolean) => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('todos')
    .update({ completed })
    .eq('id', id)
    .select()
    .single();
  
  return data;
};
```

## 🧪 테스트

### 1. 회원가입 테스트

```sql
-- 회원가입 시 자동으로 프로필 생성 확인
SELECT * FROM public.users WHERE id = auth.uid();
```

### 2. 할 일 CRUD 테스트

```sql
-- 생성
INSERT INTO public.todos (user_id, title, priority)
VALUES (auth.uid(), '테스트 할 일', 'high');

-- 조회
SELECT * FROM public.todos WHERE user_id = auth.uid();

-- 수정
UPDATE public.todos 
SET completed = true 
WHERE id = 'your-todo-id' AND user_id = auth.uid();

-- 삭제
DELETE FROM public.todos 
WHERE id = 'your-todo-id' AND user_id = auth.uid();
```

### 3. RLS 테스트

```sql
-- 다른 사용자의 할 일 조회 시도 (실패해야 정상)
SELECT * FROM public.todos WHERE user_id != auth.uid();
-- 결과: 0 rows
```

## 🔧 유지보수

### 스키마 업데이트

스키마를 수정해야 할 경우:

1. `supabase/schema.sql` 파일 수정
2. SQL Editor에서 변경사항만 실행
3. 또는 전체 스키마 재실행 (DROP IF EXISTS로 안전)

### 백업

```bash
# Supabase CLI로 백업
supabase db dump -f backup.sql
```

### 마이그레이션

```bash
# Supabase CLI로 마이그레이션 생성
supabase migration new add_new_column
```

## 🐛 문제 해결

### "permission denied for table" 오류

→ RLS 정책이 올바르게 설정되었는지 확인

```sql
-- RLS 상태 확인
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### "duplicate key value violates unique constraint" 오류

→ 이미 존재하는 데이터를 다시 생성하려는 경우

```sql
-- 기존 데이터 확인
SELECT * FROM public.users WHERE email = 'your@email.com';
```

### 트리거가 작동하지 않음

→ 트리거 상태 확인

```sql
-- 트리거 목록 확인
SELECT * FROM information_schema.triggers 
WHERE event_object_schema = 'public';
```

## 📚 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase SQL 에디터](https://supabase.com/docs/guides/database/overview)

## 📞 지원

문제가 발생하면:
1. Supabase 대시보드의 Logs 확인
2. SQL Editor에서 에러 메시지 확인
3. [Supabase Discord](https://discord.supabase.com) 커뮤니티 참여

---

**마지막 업데이트**: 2024-12-24  
**버전**: 1.0

