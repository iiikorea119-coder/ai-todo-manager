/**
 * 할 일 관리 타입 정의
 */

/**
 * 우선순위 타입
 */
export type TodoPriority = 'high' | 'medium' | 'low';

/**
 * 할 일 상태 타입
 */
export type TodoStatus = 'in-progress' | 'completed' | 'delayed';

/**
 * 할 일 데이터 인터페이스
 */
export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string;
  created_date: string;
  due_date: string | null;
  priority: TodoPriority;
  category: string[];
  completed: boolean;
}

/**
 * 할 일 생성 요청 데이터
 */
export interface CreateTodoRequest {
  title: string;
  description: string;
  due_date?: string;
  priority: TodoPriority;
  category: string[];
}

/**
 * 할 일 수정 요청 데이터
 */
export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  due_date?: string | null;
  priority?: TodoPriority;
  category?: string[];
  completed?: boolean;
}

/**
 * AI 파싱 요청 데이터
 */
export interface ParseTodoRequest {
  text: string;
}

/**
 * AI 파싱 응답 데이터
 */
export interface ParseTodoResponse {
  success: boolean;
  data?: {
    title: string;
    description?: string;
    due_date?: string;
    due_time?: string;
    priority: TodoPriority;
    category: string[];
  };
  // 여러 할 일을 동시에 파싱한 경우
  multiple?: boolean;
  items?: Array<{
    title: string;
    description?: string;
    due_date?: string;
    due_time?: string;
    priority: TodoPriority;
    category: string[];
  }>;
  error?: string;
  code?: string; // 오류 코드 (RATE_LIMIT_EXCEEDED, AUTH_FAILED, NETWORK_ERROR, PARSING_ERROR, AI_PROCESSING_ERROR, UNKNOWN_ERROR)
}

/**
 * AI 분석 요청 데이터
 */
export interface AnalyzeTodosRequest {
  todos: Todo[];
  period: 'today' | 'week';
}

/**
 * AI 분석 응답 데이터
 */
export interface AnalyzeTodosResponse {
  success: boolean;
  data?: {
    summary: string;
    urgentTasks: string[];
    insights: string[];
    recommendations: string[];
  };
  error?: string;
  code?: string;
}

