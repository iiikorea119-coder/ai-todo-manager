/**
 * 개별 할 일을 표시하는 카드 컴포넌트
 */
'use client';

import { Calendar, Clock, Tag, Trash2, Edit } from 'lucide-react';
import { Todo } from '@/types/todo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface TodoCardProps {
  todo: Todo;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onEdit?: (todo: Todo) => void;
  onDelete?: (id: string) => void;
}

/**
 * 할 일 카드 컴포넌트
 * @param todo - 할 일 데이터
 * @param onToggleComplete - 완료 상태 토글 핸들러
 * @param onEdit - 수정 핸들러
 * @param onDelete - 삭제 핸들러
 */
const TodoCard = ({ todo, onToggleComplete, onEdit, onDelete }: TodoCardProps) => {
  /**
   * 우선순위 배지 스타일 가져오기
   */
  const getPriorityClassName = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  /**
   * 우선순위 한글 레이블
   */
  const getPriorityLabel = (priority: string): string => {
    switch (priority) {
      case 'high':
        return '높음';
      case 'medium':
        return '중간';
      case 'low':
        return '낮음';
      default:
        return '';
    }
  };

  /**
   * 날짜 포맷팅
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  /**
   * 마감일이 지났는지 확인
   */
  const isOverdue = (dueDate: string | null): boolean => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && !todo.completed;
  };

  /**
   * 완료 상태 토글
   */
  const handleToggleComplete = () => {
    onToggleComplete?.(todo.id, !todo.completed);
  };

  return (
    <Card className={cn(
      'transition-all hover:shadow-md',
      todo.completed && 'opacity-60',
      isOverdue(todo.due_date) && 'border-red-500'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* 완료 체크박스 */}
          <Checkbox
            checked={todo.completed}
            onCheckedChange={handleToggleComplete}
            className="mt-1"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className={cn(
                'text-lg',
                todo.completed && 'line-through text-muted-foreground'
              )}>
                {todo.title}
              </CardTitle>
              
              {/* 액션 버튼 */}
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit?.(todo)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onDelete?.(todo.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 설명 */}
            {todo.description && (
              <CardDescription className={cn(
                'mt-2',
                todo.completed && 'line-through'
              )}>
                {todo.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 우선순위 배지 */}
        <div className="flex flex-wrap gap-2">
          <Badge className={getPriorityClassName(todo.priority)}>
            {getPriorityLabel(todo.priority)}
          </Badge>
          
          {/* 완료 상태 배지 */}
          {todo.completed && (
            <Badge className="status-completed">
              완료
            </Badge>
          )}
          
          {/* 지연 상태 배지 */}
          {isOverdue(todo.due_date) && (
            <Badge className="status-delayed">
              지연
            </Badge>
          )}
        </div>

        {/* 카테고리 */}
        {todo.category.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Tag className="h-4 w-4" />
            <div className="flex flex-wrap gap-1">
              {todo.category.map((cat, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 날짜 정보 */}
        <div className="space-y-1 text-sm text-muted-foreground">
          {/* 생성일 */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>생성: {formatDate(todo.created_date)}</span>
          </div>

          {/* 마감일 */}
          {todo.due_date && (
            <div className={cn(
              'flex items-center gap-2',
              isOverdue(todo.due_date) && 'text-red-600 dark:text-red-400'
            )}>
              <Calendar className="h-4 w-4" />
              <span>마감: {formatDate(todo.due_date)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodoCard;

