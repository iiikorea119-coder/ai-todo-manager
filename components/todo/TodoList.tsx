/**
 * 할 일 목록을 표시하는 컴포넌트
 */
'use client';

import { useState } from 'react';
import { Todo } from '@/types/todo';
import TodoCard from './TodoCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface TodoListProps {
  todos: Todo[];
  isLoading?: boolean;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onEdit?: (todo: Todo) => void;
  onDelete?: (id: string) => void;
}

/**
 * 할 일 목록 컴포넌트
 * @param todos - 할 일 목록 데이터
 * @param isLoading - 로딩 상태
 * @param onToggleComplete - 완료 상태 토글 핸들러
 * @param onEdit - 수정 핸들러
 * @param onDelete - 삭제 핸들러
 */
const TodoList = ({ todos, isLoading, onToggleComplete, onEdit, onDelete }: TodoListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_date');

  /**
   * 검색 필터링
   */
  const filterBySearch = (todo: Todo): boolean => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      todo.title.toLowerCase().includes(query) ||
      todo.description.toLowerCase().includes(query)
    );
  };

  /**
   * 우선순위 필터링
   */
  const filterByPriority = (todo: Todo): boolean => {
    if (filterPriority === 'all') return true;
    return todo.priority === filterPriority;
  };

  /**
   * 상태 필터링
   */
  const filterByStatus = (todo: Todo): boolean => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'completed') return todo.completed;
    if (filterStatus === 'in-progress') return !todo.completed;
    if (filterStatus === 'delayed') {
      return (
        !todo.completed &&
        todo.due_date !== null &&
        new Date(todo.due_date) < new Date()
      );
    }
    return true;
  };

  /**
   * 정렬 함수
   */
  const sortTodos = (a: Todo, b: Todo): number => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      
      case 'due_date':
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      
      case 'created_date':
      default:
        return new Date(b.created_date).getTime() - new Date(a.created_date).getTime();
    }
  };

  /**
   * 필터링 및 정렬된 할 일 목록
   */
  const filteredAndSortedTodos = todos
    .filter(filterBySearch)
    .filter(filterByPriority)
    .filter(filterByStatus)
    .sort(sortTodos);

  /**
   * 필터 초기화
   */
  const resetFilters = () => {
    setSearchQuery('');
    setFilterPriority('all');
    setFilterStatus('all');
    setSortBy('created_date');
  };

  /**
   * 로딩 상태 렌더링
   */
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 검색 및 필터 영역 */}
      <div className="space-y-4">
        {/* 검색 바 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="제목이나 설명으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 필터 및 정렬 옵션 */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">필터:</span>
          </div>

          {/* 우선순위 필터 */}
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="우선순위" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 우선순위</SelectItem>
              <SelectItem value="high">높음</SelectItem>
              <SelectItem value="medium">중간</SelectItem>
              <SelectItem value="low">낮음</SelectItem>
            </SelectContent>
          </Select>

          {/* 상태 필터 */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 상태</SelectItem>
              <SelectItem value="in-progress">진행 중</SelectItem>
              <SelectItem value="completed">완료</SelectItem>
              <SelectItem value="delayed">지연</SelectItem>
            </SelectContent>
          </Select>

          {/* 정렬 옵션 */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_date">생성일순</SelectItem>
              <SelectItem value="due_date">마감일순</SelectItem>
              <SelectItem value="priority">우선순위순</SelectItem>
            </SelectContent>
          </Select>

          {/* 필터 초기화 버튼 */}
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="w-full sm:w-auto"
          >
            초기화
          </Button>
        </div>
      </div>

      {/* 할 일 목록 */}
      {filteredAndSortedTodos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">
            {searchQuery || filterPriority !== 'all' || filterStatus !== 'all'
              ? '검색 결과가 없습니다.'
              : '아직 할 일이 없습니다.'}
          </p>
          {(searchQuery || filterPriority !== 'all' || filterStatus !== 'all') && (
            <Button variant="outline" onClick={resetFilters}>
              필터 초기화
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* 결과 개수 표시 */}
          <div className="text-sm text-muted-foreground">
            총 {filteredAndSortedTodos.length}개의 할 일
          </div>

          {/* 할 일 카드 목록 */}
          <div className="grid gap-4">
            {filteredAndSortedTodos.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoList;

