/**
 * AI 기반 할 일 분석 및 요약 컴포넌트
 */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb,
  Target,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  Calendar,
  RefreshCw
} from 'lucide-react';
import type { Todo, AnalyzeTodosResponse } from '@/types/todo';

interface TodoAnalysisProps {
  todos: Todo[];
}

export const TodoAnalysis = ({ todos }: TodoAnalysisProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [todayAnalysis, setTodayAnalysis] = useState<AnalyzeTodosResponse['data'] | null>(null);
  const [weekAnalysis, setWeekAnalysis] = useState<AnalyzeTodosResponse['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState<'today' | 'week'>('today');

  // 오늘 날짜와 이번 주 범위 계산
  const getFilteredTodos = (period: 'today' | 'week'): Todo[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (period === 'today') {
      return todos.filter(todo => {
        if (!todo.due_date) return false;
        const dueDate = new Date(todo.due_date);
        return dueDate >= today && dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
      });
    } else {
      // 이번 주 (월요일 시작)
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(today);
      monday.setDate(monday.getDate() + diffToMonday);
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 7);

      return todos.filter(todo => {
        if (!todo.due_date) return false;
        const dueDate = new Date(todo.due_date);
        return dueDate >= monday && dueDate < sunday;
      });
    }
  };

  // AI 분석 실행
  const handleAnalyze = async (period: 'today' | 'week') => {
    setIsAnalyzing(true);
    setError(null);
    setActivePeriod(period);

    try {
      const filteredTodos = getFilteredTodos(period);

      const response = await fetch('/api/analyze-todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          todos: filteredTodos,
          period,
        }),
      });

      const result: AnalyzeTodosResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'AI 분석에 실패했습니다.');
      }

      // 탭별로 결과 저장
      if (period === 'today') {
        setTodayAnalysis(result.data || null);
      } else {
        setWeekAnalysis(result.data || null);
      }
    } catch (err) {
      console.error('AI 분석 오류:', err);
      setError(err instanceof Error ? err.message : 'AI 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 완료율 계산
  const calculateCompletionRate = (period: 'today' | 'week') => {
    const filteredTodos = getFilteredTodos(period);
    if (filteredTodos.length === 0) return 0;
    const completed = filteredTodos.filter(t => t.completed).length;
    return Math.round((completed / filteredTodos.length) * 100);
  };

  // 남은 할 일 가져오기
  const getRemainingTodos = (period: 'today' | 'week') => {
    return getFilteredTodos(period).filter(t => !t.completed);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-600" />
          AI 요약 및 분석
        </CardTitle>
        <CardDescription>
          할 일 목록을 AI가 분석하여 인사이트와 추천 사항을 제공합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="today">오늘의 요약</TabsTrigger>
            <TabsTrigger value="week">이번 주 요약</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4 mt-4">
            <Button
              onClick={() => handleAnalyze('today')}
              disabled={isAnalyzing && activePeriod === 'today'}
              className="w-full bg-violet-600 hover:bg-violet-700"
            >
              {isAnalyzing && activePeriod === 'today' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI 분석 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI 요약 보기
                </>
              )}
            </Button>

            {error && activePeriod === 'today' && (
              <Alert variant="destructive">
                <AlertDescription className="flex items-center justify-between">
                  <span>{error}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAnalyze('today')}
                    className="ml-2"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    재시도
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {todayAnalysis && (
              <TodayAnalysisDisplay 
                data={todayAnalysis} 
                todos={getFilteredTodos('today')}
                completionRate={calculateCompletionRate('today')}
                remainingTodos={getRemainingTodos('today')}
              />
            )}
          </TabsContent>

          <TabsContent value="week" className="space-y-4 mt-4">
            <Button
              onClick={() => handleAnalyze('week')}
              disabled={isAnalyzing && activePeriod === 'week'}
              className="w-full bg-violet-600 hover:bg-violet-700"
            >
              {isAnalyzing && activePeriod === 'week' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI 분석 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI 요약 보기
                </>
              )}
            </Button>

            {error && activePeriod === 'week' && (
              <Alert variant="destructive">
                <AlertDescription className="flex items-center justify-between">
                  <span>{error}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAnalyze('week')}
                    className="ml-2"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    재시도
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {weekAnalysis && (
              <WeekAnalysisDisplay 
                data={weekAnalysis}
                todos={getFilteredTodos('week')}
                completionRate={calculateCompletionRate('week')}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// 오늘의 요약 표시 컴포넌트
const TodayAnalysisDisplay = ({ 
  data, 
  todos,
  completionRate,
  remainingTodos
}: { 
  data: NonNullable<AnalyzeTodosResponse['data']>;
  todos: Todo[];
  completionRate: number;
  remainingTodos: Todo[];
}) => {
  return (
    <div className="space-y-4">
      {/* 완료율 카드 */}
      <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-violet-200 dark:border-violet-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-violet-700 dark:text-violet-300 font-medium">오늘의 완료율</p>
              <p className="text-4xl font-bold text-violet-900 dark:text-violet-100 mt-1">
                {completionRate}%
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-violet-200 dark:bg-violet-800 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-violet-600 dark:text-violet-300" />
            </div>
          </div>
          <Progress value={completionRate} className="h-3" />
          <p className="text-sm text-violet-600 dark:text-violet-400 mt-2">{data.summary}</p>
        </CardContent>
      </Card>

      {/* 긴급 작업 */}
      {data.urgentTasks && data.urgentTasks.length > 0 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-red-900 dark:text-red-100">
              <AlertTriangle className="w-5 h-5" />
              🚨 오늘 집중해야 할 작업
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.urgentTasks.map((task, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded bg-red-50 dark:bg-red-950/20">
                  <Target className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <span className="text-red-900 dark:text-red-100 font-medium">{task}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 남은 할 일 */}
      {remainingTodos.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              남은 할 일 ({remainingTodos.length}개)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {remainingTodos.slice(0, 5).map((todo) => (
                <div key={todo.id} className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm">{todo.title}</span>
                  <Badge variant={
                    todo.priority === 'high' ? 'destructive' : 
                    todo.priority === 'medium' ? 'default' : 
                    'secondary'
                  }>
                    {todo.priority === 'high' ? '높음' : todo.priority === 'medium' ? '중간' : '낮음'}
                  </Badge>
                </div>
              ))}
              {remainingTodos.length > 5 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  그 외 {remainingTodos.length - 5}개 더...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 인사이트 */}
      {data.insights && data.insights.length > 0 && (
        <Card className="bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <TrendingUp className="w-5 h-5" />
              💡 인사이트
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <p className="text-sm text-blue-900 dark:text-blue-100">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 추천 사항 */}
      {data.recommendations && data.recommendations.length > 0 && (
        <Card className="bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-green-900 dark:text-green-100">
              <Lightbulb className="w-5 h-5" />
              🎯 추천 사항
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2 p-3 rounded bg-white dark:bg-gray-900 border border-green-200 dark:border-green-800">
                  <span className="text-green-600 dark:text-green-400 flex-shrink-0">✓</span>
                  <p className="text-sm text-green-900 dark:text-green-100">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// 이번 주 요약 표시 컴포넌트
const WeekAnalysisDisplay = ({ 
  data,
  todos,
  completionRate
}: { 
  data: NonNullable<AnalyzeTodosResponse['data']>;
  todos: Todo[];
  completionRate: number;
}) => {
  return (
    <div className="space-y-4">
      {/* 주간 완료율 */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">이번 주 완료율</p>
              <p className="text-4xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                {completionRate}%
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
          <Progress value={completionRate} className="h-3" />
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">{data.summary}</p>
        </CardContent>
      </Card>

      {/* 주간 통계 */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">전체 할 일</p>
            <p className="text-3xl font-bold mt-1">{todos.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">완료된 할 일</p>
            <p className="text-3xl font-bold mt-1 text-green-600">
              {todos.filter(t => t.completed).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 긴급 작업 */}
      {data.urgentTasks && data.urgentTasks.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-orange-900 dark:text-orange-100">
              <AlertCircle className="w-5 h-5" />
              ⚠️ 이번 주 중요 작업
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.urgentTasks.map((task, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded bg-orange-50 dark:bg-orange-950/20">
                  <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                  <span className="text-orange-900 dark:text-orange-100">{task}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 주간 인사이트 */}
      {data.insights && data.insights.length > 0 && (
        <Card className="bg-purple-50/50 dark:bg-purple-950/10 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-purple-900 dark:text-purple-100">
              <TrendingUp className="w-5 h-5" />
              📊 주간 생산성 패턴
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2 p-3 rounded bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-800">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-purple-900 dark:text-purple-100">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* 다음 주 계획 제안 */}
      {data.recommendations && data.recommendations.length > 0 && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-green-900 dark:text-green-100">
              <Target className="w-5 h-5" />
              🎯 다음 주 계획 제안
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded bg-white dark:bg-gray-900 border border-green-200 dark:border-green-800">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-green-700 dark:text-green-300">{index + 1}</span>
                  </div>
                  <p className="text-sm text-green-900 dark:text-green-100 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TodoAnalysis;

