/**
 * 할 일 추가/편집 폼 컴포넌트
 */
'use client';

import { useState, useEffect } from 'react';
import { Todo, CreateTodoRequest, TodoPriority, ParseTodoResponse } from '@/types/todo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, X, Sparkles, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface TodoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTodoRequest) => void | Promise<void>;
  editTodo?: Todo | null;
  isLoading?: boolean;
}

// 미리 정의된 카테고리 목록
const PRESET_CATEGORIES = ['업무', '개인', '학습', '건강', '취미', '기타'];

/**
 * 할 일 추가/편집 폼 컴포넌트
 * @param isOpen - 다이얼로그 열림 상태
 * @param onClose - 닫기 핸들러
 * @param onSubmit - 제출 핸들러
 * @param editTodo - 수정할 할 일 (수정 모드일 때)
 * @param isLoading - 로딩 상태
 */
const TodoForm = ({ isOpen, onClose, onSubmit, editTodo, isLoading }: TodoFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // AI 입력 관련 상태
  const [aiInput, setAiInput] = useState('');
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAiInput, setShowAiInput] = useState(true);

  /**
   * 편집 모드일 때 폼 데이터 초기화
   */
  useEffect(() => {
    if (editTodo) {
      setTitle(editTodo.title);
      setDescription(editTodo.description);
      setPriority(editTodo.priority);
      setDueDate(editTodo.due_date ? new Date(editTodo.due_date) : undefined);
      setSelectedCategories(editTodo.category);
    } else {
      resetForm();
    }
  }, [editTodo, isOpen]);

  /**
   * 폼 초기화
   */
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate(undefined);
    setSelectedCategories([]);
    setCustomCategory('');
    setErrors({});
    setAiInput('');
    setAiError(null);
    setShowAiInput(true);
  };

  /**
   * AI로 자연어 파싱
   */
  const handleAiParse = async () => {
    // 입력 정규화
    // 1. 앞뒤 공백 제거
    // 2. 연속된 공백을 하나로 통합
    // 3. 대소문자 정규화 (소문자로 변환)
    let normalizedInput = aiInput
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();
    
    // 정규화된 입력으로 업데이트 (사용자에게 보여주기)
    setAiInput(normalizedInput);
    
    // 입력 검증
    const trimmedInput = normalizedInput;
    
    if (!trimmedInput) {
      setAiError('할 일 내용을 입력해주세요.');
      return;
    }
    
    if (trimmedInput.length < 2) {
      setAiError('할 일은 최소 2자 이상 입력해주세요.');
      return;
    }
    
    if (trimmedInput.length > 500) {
      setAiError(`할 일은 최대 500자까지 입력 가능합니다. (현재: ${trimmedInput.length}자)`);
      return;
    }
    
    // 이모지 검증
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/u;
    if (emojiRegex.test(trimmedInput)) {
      setAiError('허용되지 않은 입력입니다. 이모지를 제거하고 다시 시도해주세요.');
      return;
    }
    
    // 의미없는 문자열 검증
    // 1. 숫자만으로 이루어진 경우
    if (/^\d+$/.test(trimmedInput)) {
      setAiError('잘못된 입력입니다. 의미 있는 할 일을 입력해주세요.');
      return;
    }
    
    // 2. 연속된 같은 문자 (3개 이상 반복)
    if (/(.)\1{2,}/.test(trimmedInput)) {
      setAiError('잘못된 입력입니다. 의미 있는 할 일을 입력해주세요.');
      return;
    }
    
    // 3. 키보드 연타 패턴 감지
    const keyboardPatterns = [
      'qwer', 'asdf', 'zxcv', 'qaz', 'wsx', 'edc',
      'ㅂㅈㄷㄱ', 'ㅁㄴㅇㄹ', 'ㅋㅌㅊㅍ',
      '1234', '5678', '9012'
    ];
    
    const lowerInput = trimmedInput.toLowerCase();
    if (keyboardPatterns.some(pattern => lowerInput.includes(pattern))) {
      setAiError('잘못된 입력입니다. 의미 있는 할 일을 입력해주세요.');
      return;
    }
    
    // 4. 한글 자음/모음만 있는 경우
    if (/^[ㄱ-ㅎㅏ-ㅣ]+$/.test(trimmedInput)) {
      setAiError('잘못된 입력입니다. 완성된 문장을 입력해주세요.');
      return;
    }
    
    // 5. 과거 날짜 키워드 감지
    const pastDateKeywords = [
      '어제', '그제', '그저께', '엊그제',
      '지난주', '지난달', '지난해', '작년',
      'yesterday', 'last week', 'last month', 'last year'
    ];
    
    if (pastDateKeywords.some(keyword => trimmedInput.includes(keyword))) {
      setAiError('과거 날짜는 사용할 수 없습니다. 오늘 이후의 날짜를 입력해주세요.');
      return;
    }

    setIsAiParsing(true);
    setAiError(null);

    try {
      const response = await fetch('/api/parse-todo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: aiInput }),
      });

      const result: ParseTodoResponse = await response.json();

      if (!response.ok || !result.success) {
        // 오류 코드별 사용자 친화적 메시지 처리
        let userFriendlyMessage = result.error || 'AI 파싱에 실패했습니다.';
        
        // HTTP 상태 코드별 처리
        switch (response.status) {
          case 400: // Bad Request
            // 이미 서버에서 친화적 메시지를 보내므로 그대로 사용
            userFriendlyMessage = result.error || '잘못된 요청입니다. 입력 내용을 확인해주세요.';
            break;
            
          case 429: // Too Many Requests
            userFriendlyMessage = '⏱️ API 호출 한도를 초과했습니다.\n잠시 후 다시 시도해주세요. (약 1분 후)';
            break;
            
          case 500: // Internal Server Error
            // 오류 코드별 세부 메시지
            if (result.code === 'AUTH_FAILED') {
              userFriendlyMessage = '🔐 AI 서비스 인증 문제가 발생했습니다.\n관리자에게 문의해주세요.';
            } else if (result.code === 'NETWORK_ERROR') {
              userFriendlyMessage = '🌐 네트워크 연결을 확인할 수 없습니다.\n인터넷 연결을 확인하고 다시 시도해주세요.';
            } else if (result.code === 'PARSING_ERROR') {
              userFriendlyMessage = '🤖 AI가 입력을 이해하지 못했습니다.\n다른 표현으로 다시 시도해주세요.';
            } else if (result.code === 'AI_PROCESSING_ERROR') {
              userFriendlyMessage = '⚠️ AI 처리 중 일시적 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.';
            } else {
              userFriendlyMessage = '❌ 서버 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.';
            }
            break;
            
          case 503: // Service Unavailable
            userFriendlyMessage = '🔧 서비스가 일시적으로 사용 불가능합니다.\n잠시 후 다시 시도해주세요.';
            break;
            
          default:
            userFriendlyMessage = result.error || '예상치 못한 오류가 발생했습니다.\n다시 시도해주세요.';
        }
        
        throw new Error(userFriendlyMessage);
      }

      // 여러 할 일을 파싱한 경우
      if (result.multiple && result.items && result.items.length > 0) {
        // 여러 할 일을 각각 생성
        setAiError(null);
        setShowAiInput(false);
        setAiInput('');
        
        // 사용자에게 알림 표시
        toast.success(`🎯 ${result.items.length}개의 할 일을 감지했습니다!`, {
          description: `모든 할 일을 자동으로 추가하고 있습니다...`,
          duration: 3000,
        });
        
        // 모든 할 일을 자동으로 저장 (첫 번째 포함)
        let successCount = 0;
        let failCount = 0;
        
        for (let i = 0; i < result.items.length; i++) {
          const item = result.items[i];
          const formData: CreateTodoRequest = {
            title: item.title,
            description: item.description || '',
            priority: item.priority,
            category: item.category || ['기타'],
            due_date: item.due_date && item.due_time 
              ? `${item.due_date}T${item.due_time}:00`
              : item.due_date 
              ? `${item.due_date}T09:00:00`
              : undefined,
          };
          
          try {
            // 자동으로 저장
            await onSubmit(formData);
            successCount++;
            console.log(`✅ 할 일 자동 저장 성공 (${i + 1}/${result.items.length}): ${item.title}`);
          } catch (error) {
            failCount++;
            console.error(`❌ 할 일 자동 저장 실패 (${item.title}):`, error);
          }
        }
        
        // 최종 결과 알림
        if (failCount === 0) {
          toast.success(`✅ ${successCount}개의 할 일이 모두 추가되었습니다!`, {
            duration: 3000,
          });
        } else {
          toast.warning(`⚠️ ${successCount}개 추가 성공, ${failCount}개 실패`, {
            duration: 4000,
          });
        }
        
        // 폼 닫기
        onClose();
      } else if (result.data) {
        // 단일 할 일을 파싱한 경우 (기존 로직)
        // 파싱된 데이터로 폼 채우기
        setTitle(result.data.title);
        setDescription(result.data.description || '');
        setPriority(result.data.priority);
        setSelectedCategories(result.data.category || []);

        // 날짜와 시간 처리
        if (result.data.due_date) {
          let dateTimeString = result.data.due_date;
          
          // 시간이 있으면 결합
          if (result.data.due_time) {
            dateTimeString = `${result.data.due_date}T${result.data.due_time}:00`;
          } else {
            // 시간이 없으면 기본값 09:00 사용
            dateTimeString = `${result.data.due_date}T09:00:00`;
          }
          
          setDueDate(new Date(dateTimeString));
        }

        // AI 입력 영역 숨기기
        setShowAiInput(false);
        setAiInput('');
      }
    } catch (error) {
      console.error('AI 파싱 오류:', error);
      // 네트워크 오류 (fetch 자체 실패)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setAiError('🌐 네트워크 연결에 실패했습니다.\n인터넷 연결을 확인하고 다시 시도해주세요.');
      } else {
        setAiError(error instanceof Error ? error.message : '❌ AI 파싱 중 오류가 발생했습니다.\n다시 시도해주세요.');
      }
    } finally {
      setIsAiParsing(false);
    }
  };

  /**
   * 폼 유효성 검사
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = '제목은 필수입니다.';
    }

    if (title.length > 100) {
      newErrors.title = '제목은 100자 이내로 입력해주세요.';
    }

    if (description.length > 1000) {
      newErrors.description = '설명은 1000자 이내로 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 카테고리 토글
   */
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  /**
   * 커스텀 카테고리 추가
   */
  const addCustomCategory = () => {
    const trimmedCategory = customCategory.trim();
    if (trimmedCategory && !selectedCategories.includes(trimmedCategory)) {
      setSelectedCategories((prev) => [...prev, trimmedCategory]);
      setCustomCategory('');
    }
  };

  /**
   * 카테고리 제거
   */
  const removeCategory = (category: string) => {
    setSelectedCategories((prev) => prev.filter((c) => c !== category));
  };

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData: CreateTodoRequest = {
      title: title.trim(),
      description: description.trim(),
      priority,
      category: selectedCategories,
      due_date: dueDate ? dueDate.toISOString() : undefined,
    };

    try {
      await onSubmit(formData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('할 일 저장 실패:', error);
      setErrors({ submit: '할 일 저장에 실패했습니다. 다시 시도해주세요.' });
    }
  };

  /**
   * 다이얼로그 닫기 핸들러
   */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editTodo ? '할 일 수정' : '새 할 일 추가'}
          </DialogTitle>
          <DialogDescription>
            {editTodo
              ? '할 일의 내용을 수정할 수 있습니다.'
              : '새로운 할 일을 추가하세요. 모든 정보는 나중에 수정할 수 있습니다.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* AI 자연어 입력 (편집 모드가 아닐 때만 표시) */}
          {!editTodo && showAiInput && (
            <div className="space-y-3 p-4 rounded-lg bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border border-violet-200 dark:border-violet-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-600" />
                <Label className="text-base font-semibold text-violet-900 dark:text-violet-100">
                  AI로 할 일 생성
                </Label>
              </div>
              <p className="text-sm text-violet-700 dark:text-violet-300">
                자연어로 입력하면 AI가 자동으로 할 일을 구조화합니다.
                <br />
                쉼표(,)로 구분하여 여러 할 일을 한 번에 추가할 수 있습니다.
              </p>
              <div className="space-y-2">
                <Textarea
                  placeholder="예: 내일 오후 3시까지 중요한 팀 회의 준비하기&#10;또는: 회의준비, 자료작성, 발표 연습"
                  value={aiInput}
                  onChange={(e) => {
                    setAiInput(e.target.value);
                    setAiError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleAiParse();
                    }
                  }}
                  rows={3}
                  disabled={isAiParsing || isLoading}
                  className="resize-none"
                />
                {aiError && (
                  <Alert variant="destructive" className="py-3">
                    <AlertDescription className="text-sm whitespace-pre-line leading-relaxed">
                      {aiError}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleAiParse}
                    disabled={isAiParsing || isLoading}
                    className="flex-1 bg-violet-600 hover:bg-violet-700"
                  >
                    {isAiParsing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        AI 분석 중...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI로 생성
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAiInput(false)}
                    disabled={isAiParsing || isLoading}
                  >
                    수동 입력
                  </Button>
                </div>
                <p className="text-xs text-violet-600 dark:text-violet-400">
                  팁: Ctrl+Enter (Mac: Cmd+Enter)로 빠르게 생성할 수 있습니다.
                </p>
              </div>
            </div>
          )}

          {/* AI 입력이 숨겨진 경우 다시 보기 버튼 */}
          {!editTodo && !showAiInput && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAiInput(true)}
              className="w-full border-dashed border-violet-300 text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/20"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI로 다시 생성하기
            </Button>
          )}

          {/* 제목 */}
          <div className="space-y-2">
            <Label htmlFor="title" className="required">
              제목
            </Label>
            <Input
              id="title"
              placeholder="할 일 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={cn(errors.title && 'border-red-500')}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* 설명 */}
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              placeholder="할 일에 대한 상세한 설명을 입력하세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={cn(errors.description && 'border-red-500')}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* 우선순위와 마감일 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 우선순위 */}
            <div className="space-y-2">
              <Label htmlFor="priority">우선순위</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as TodoPriority)}
                disabled={isLoading}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="우선순위 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">높음</SelectItem>
                  <SelectItem value="medium">중간</SelectItem>
                  <SelectItem value="low">낮음</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 마감일 */}
            <div className="space-y-2">
              <Label>마감일</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dueDate && 'text-muted-foreground'
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? (
                      format(dueDate, 'PPP', { locale: ko })
                    ) : (
                      <span>날짜 선택</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    locale={ko}
                  />
                </PopoverContent>
              </Popover>
              {dueDate && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDueDate(undefined)}
                  className="w-full"
                  disabled={isLoading}
                >
                  마감일 제거
                </Button>
              )}
            </div>
          </div>

          {/* 카테고리 */}
          <div className="space-y-2">
            <Label>카테고리</Label>
            
            {/* 미리 정의된 카테고리 */}
            <div className="flex flex-wrap gap-2">
              {PRESET_CATEGORIES.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => !isLoading && toggleCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>

            {/* 선택된 카테고리 */}
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-sm text-muted-foreground">선택됨:</span>
                {selectedCategories.map((category) => (
                  <Badge key={category} className="gap-1">
                    {category}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => !isLoading && removeCategory(category)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* 커스텀 카테고리 추가 */}
            <div className="flex gap-2">
              <Input
                placeholder="직접 입력..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomCategory();
                  }
                }}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addCustomCategory}
                disabled={isLoading || !customCategory.trim()}
              >
                추가
              </Button>
            </div>
          </div>

          {/* 에러 메시지 */}
          {errors.submit && (
            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md">
              {errors.submit}
            </div>
          )}

          {/* 액션 버튼 */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '저장 중...' : editTodo ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TodoForm;

