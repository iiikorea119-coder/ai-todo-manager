# Supabase 설정

AI 할 일 관리 프로젝트의 Supabase 클라이언트 설정입니다.

## 파일 구조

```
lib/supabase/
├── client.ts       # 클라이언트 컴포넌트용
├── server.ts       # 서버 컴포넌트용
├── middleware.ts   # 미들웨어용
├── types.ts        # 데이터베이스 타입
└── README.md       # 사용 가이드
```

## 환경 변수

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

## 사용 방법

### 1. 클라이언트 컴포넌트

`'use client'` 컴포넌트에서 사용:

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

const MyComponent = () => {
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    getUser();
  }, []);

  return <div>User: {user?.email}</div>;
};
```

### 2. 서버 컴포넌트

서버 컴포넌트에서 사용:

```typescript
import { createClient } from '@/lib/supabase/server';

const MyServerComponent = async () => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  return <div>User: {user?.email}</div>;
};

export default MyServerComponent;
```

### 3. Server Actions

Server Actions에서 사용:

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';

export const createTodo = async (title: string) => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('인증이 필요합니다.');
  }

  const { data, error } = await supabase
    .from('todos')
    .insert([
      {
        user_id: user.id,
        title,
        completed: false,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

### 4. API 라우트

API 라우트에서 사용:

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { error: '인증이 필요합니다.' },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
```

## 인증 (Auth)

### 회원가입

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';

const signUp = async (email: string, password: string) => {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
};
```

### 로그인

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';

const signIn = async (email: string, password: string) => {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};
```

### 로그아웃

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';

const signOut = async () => {
  const supabase = createClient();
  
  const { error } = await supabase.auth.signOut();
  
  if (error) throw error;
};
```

### 현재 사용자 가져오기

```typescript
// 서버 컴포넌트
import { createClient } from '@/lib/supabase/server';

const getUser = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
```

```typescript
// 클라이언트 컴포넌트
'use client';

import { createClient } from '@/lib/supabase/client';

const getUser = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
```

## 미들웨어 설정

인증이 필요한 페이지를 보호하려면 `middleware.ts` 파일을 생성하세요:

```typescript
import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  // 인증이 필요한 페이지
  if (request.nextUrl.pathname.startsWith('/todos')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 로그인한 사용자가 인증 페이지 접근 시
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

## 데이터베이스 작업

### 데이터 조회

```typescript
const { data, error } = await supabase
  .from('todos')
  .select('*')
  .eq('user_id', userId);
```

### 데이터 생성

```typescript
const { data, error } = await supabase
  .from('todos')
  .insert([{ title: '새 할 일', user_id: userId }])
  .select()
  .single();
```

### 데이터 수정

```typescript
const { data, error } = await supabase
  .from('todos')
  .update({ completed: true })
  .eq('id', todoId)
  .select()
  .single();
```

### 데이터 삭제

```typescript
const { error } = await supabase
  .from('todos')
  .delete()
  .eq('id', todoId);
```

## 타입 안정성

`types.ts` 파일에 정의된 Database 타입을 사용하여 타입 안정성을 보장할 수 있습니다:

```typescript
import { Database } from '@/lib/supabase/types';

const supabase = createClient<Database>();

// 이제 자동완성과 타입 체크가 가능합니다
const { data, error } = await supabase
  .from('todos')  // 'todos' 테이블이 자동완성됨
  .select('*');   // 컬럼들이 자동완성됨
```

### 타입 자동 생성

Supabase CLI를 사용하여 데이터베이스 스키마에서 타입을 자동으로 생성할 수 있습니다:

```bash
# Supabase CLI 설치
npm install -g supabase

# 타입 생성
supabase gen types typescript --project-id your-project-id > lib/supabase/types.ts
```

## 실시간 구독

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect } from 'react';

const RealtimeComponent = () => {
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('todos')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
        },
        (payload) => {
          console.log('변경 감지:', payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return <div>실시간 구독 활성화</div>;
};
```

## 에러 처리

```typescript
const handleError = (error: any) => {
  console.error('Supabase 에러:', error);
  
  // 한글 에러 메시지로 변환
  if (error.code === '23505') {
    return '이미 존재하는 데이터입니다.';
  } else if (error.code === '42501') {
    return '권한이 없습니다.';
  } else {
    return '오류가 발생했습니다. 다시 시도해주세요.';
  }
};
```

## 보안 (RLS)

Supabase에서 Row Level Security (RLS)를 활성화하여 데이터 보안을 강화하세요:

```sql
-- todos 테이블에 RLS 활성화
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 자신의 데이터만 조회 가능
CREATE POLICY "Users can view own todos"
  ON todos FOR SELECT
  USING (auth.uid() = user_id);

-- 자신의 데이터만 생성 가능
CREATE POLICY "Users can create own todos"
  ON todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 자신의 데이터만 수정 가능
CREATE POLICY "Users can update own todos"
  ON todos FOR UPDATE
  USING (auth.uid() = user_id);

-- 자신의 데이터만 삭제 가능
CREATE POLICY "Users can delete own todos"
  ON todos FOR DELETE
  USING (auth.uid() = user_id);
```

## 디버깅

개발 환경에서 Supabase 쿼리를 디버깅하려면:

```typescript
const { data, error } = await supabase
  .from('todos')
  .select('*')
  .eq('user_id', userId);

console.log('데이터:', data);
console.log('에러:', error);
```

## 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Next.js + Supabase 가이드](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [@supabase/ssr 패키지](https://github.com/supabase/ssr)

