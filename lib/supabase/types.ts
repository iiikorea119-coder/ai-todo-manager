/**
 * Supabase 데이터베이스 타입 정의
 * supabase gen types typescript 명령어로 자동 생성 가능
 * 
 * 자동 생성 방법:
 * supabase gen types typescript --project-id your-project-id > lib/supabase/types.ts
 */

/**
 * Database 타입
 * schema.sql 기반으로 생성됨
 */
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'users_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      todos: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          created_date: string;
          due_date: string | null;
          priority: 'high' | 'medium' | 'low';
          category: string[];
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          created_date?: string;
          due_date?: string | null;
          priority?: 'high' | 'medium' | 'low';
          category?: string[];
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          created_date?: string;
          due_date?: string | null;
          priority?: 'high' | 'medium' | 'low';
          category?: string[];
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'todos_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      user_todo_stats: {
        Row: {
          user_id: string;
          email: string;
          name: string | null;
          total_todos: number;
          completed_todos: number;
          pending_todos: number;
          overdue_todos: number;
        };
      };
    };
    Functions: {
      get_overdue_todos_count: {
        Args: {
          p_user_id: string;
        };
        Returns: number;
      };
      get_today_due_todos: {
        Args: {
          p_user_id: string;
        };
        Returns: Database['public']['Tables']['todos']['Row'][];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

/**
 * 타입 헬퍼
 */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

/**
 * 자주 사용하는 타입들
 */
export type User = Tables<'users'>;
export type Todo = Tables<'todos'>;
export type TodoInsert = Database['public']['Tables']['todos']['Insert'];
export type TodoUpdate = Database['public']['Tables']['todos']['Update'];
export type UserTodoStats = Database['public']['Views']['user_todo_stats']['Row'];

