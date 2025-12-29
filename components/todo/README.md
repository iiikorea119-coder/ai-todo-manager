# Todo 컴포넌트

AI 할 일 관리 서비스의 Todo 관련 컴포넌트 모음입니다.

## 컴포넌트 목록

### 1. TodoCard
개별 할 일을 표시하는 카드 컴포넌트입니다.

**주요 기능:**
- 할 일 제목, 설명, 우선순위 표시
- 완료 체크박스
- 카테고리 배지
- 생성일 및 마감일 표시
- 수정/삭제 버튼
- 지연 상태 표시

### 2. TodoList
할 일 목록을 표시하고 검색, 필터링, 정렬 기능을 제공하는 컴포넌트입니다.

**주요 기능:**
- 검색 기능 (제목, 설명)
- 우선순위 필터링 (높음/중간/낮음)
- 상태 필터링 (진행 중/완료/지연)
- 정렬 (생성일순/마감일순/우선순위순)
- 로딩 상태 처리
- 빈 상태 UI

### 3. TodoForm
할 일을 추가하거나 수정하는 폼 컴포넌트입니다.

**주요 기능:**
- 제목 및 설명 입력
- 우선순위 선택
- 마감일 선택 (캘린더)
- 카테고리 선택 및 커스텀 입력
- 폼 유효성 검사
- 로딩 상태 처리

## 설치 및 설정

이 컴포넌트들은 다음 패키지들이 필요합니다:

```bash
npm install date-fns lucide-react
```

## 사용 예시

### 기본 사용법

```tsx
'use client';

import { useState } from 'react';
import { TodoList, TodoForm } from '@/components/todo';
import { Todo, CreateTodoRequest } from '@/types/todo';
import { Button } from '@/components/ui/button';

const TodoPage = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  // 할 일 추가
  const handleAddTodo = async (data: CreateTodoRequest) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      user_id: 'current-user-id',
      ...data,
      created_date: new Date().toISOString(),
      due_date: data.due_date || null,
      completed: false,
    };
    setTodos([...todos, newTodo]);
  };

  // 완료 상태 토글
  const handleToggleComplete = (id: string, completed: boolean) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed } : todo
    ));
  };

  // 할 일 수정
  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setIsFormOpen(true);
  };

  // 할 일 삭제
  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setTodos(todos.filter(todo => todo.id !== id));
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">할 일 관리</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          새 할 일 추가
        </Button>
      </div>

      <TodoList
        todos={todos}
        onToggleComplete={handleToggleComplete}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <TodoForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTodo(null);
        }}
        onSubmit={handleAddTodo}
        editTodo={editingTodo}
      />
    </div>
  );
};

export default TodoPage;
```

### Supabase와 함께 사용하기

```tsx
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { TodoList, TodoForm } from '@/components/todo';
import { Todo, CreateTodoRequest } from '@/types/todo';

const TodoPage = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const supabase = createClientComponentClient();

  // 할 일 목록 불러오기
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .order('created_date', { ascending: false });

        if (error) throw error;
        setTodos(data || []);
      } catch (error) {
        console.error('할 일 목록 조회 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodos();
  }, [supabase]);

  // 할 일 추가
  const handleAddTodo = async (data: CreateTodoRequest) => {
    try {
      const { data: newTodo, error } = await supabase
        .from('todos')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      setTodos([newTodo, ...todos]);
    } catch (error) {
      console.error('할 일 추가 실패:', error);
      throw error;
    }
  };

  // 완료 상태 토글
  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed })
        .eq('id', id);

      if (error) throw error;
      
      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, completed } : todo
      ));
    } catch (error) {
      console.error('할 일 상태 업데이트 실패:', error);
    }
  };

  // 할 일 삭제
  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('할 일 삭제 실패:', error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <TodoList
        todos={todos}
        isLoading={isLoading}
        onToggleComplete={handleToggleComplete}
        onDelete={handleDelete}
      />

      <TodoForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddTodo}
      />
    </div>
  );
};

export default TodoPage;
```

## 스타일 커스터마이징

globals.css에 정의된 유틸리티 클래스를 사용하여 스타일을 커스터마이징할 수 있습니다:

```css
/* 우선순위 */
.priority-high { /* 높음 - 빨강 */ }
.priority-medium { /* 중간 - 노랑 */ }
.priority-low { /* 낮음 - 초록 */ }

/* 상태 */
.status-completed { /* 완료 */ }
.status-in-progress { /* 진행 중 */ }
.status-delayed { /* 지연 */ }
```

## Props 인터페이스

### TodoCard Props

```typescript
interface TodoCardProps {
  todo: Todo;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onEdit?: (todo: Todo) => void;
  onDelete?: (id: string) => void;
}
```

### TodoList Props

```typescript
interface TodoListProps {
  todos: Todo[];
  isLoading?: boolean;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onEdit?: (todo: Todo) => void;
  onDelete?: (id: string) => void;
}
```

### TodoForm Props

```typescript
interface TodoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTodoRequest) => void | Promise<void>;
  editTodo?: Todo | null;
  isLoading?: boolean;
}
```

## 주의사항

1. **date-fns 설치 필요**: TodoForm에서 날짜 포맷팅을 위해 date-fns를 사용합니다.
2. **Shadcn/ui 컴포넌트**: 모든 UI 컴포넌트는 Shadcn/ui를 기반으로 합니다.
3. **타입 안정성**: TypeScript strict 모드를 사용하므로 타입을 정확히 지정해야 합니다.
4. **에러 처리**: 비동기 작업 시 try-catch를 사용하여 에러를 적절히 처리하세요.

## 라이선스

MIT

