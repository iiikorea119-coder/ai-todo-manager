/**
 * AI 기반 할 일 분석 및 요약 API
 * Gemini API를 사용하여 사용자의 할 일 목록을 분석하고 인사이트 제공
 */
import { NextRequest, NextResponse } from 'next/server';
import type { Todo } from '@/types/todo';

interface AnalysisResult {
  summary: string;
  urgentTasks: string[];
  insights: string[];
  recommendations: string[];
}

export async function POST(req: NextRequest) {
  try {
    // 요청 본문 파싱
    const body = await req.json();
    const { todos, period } = body;

    // 입력 검증
    if (!todos || !Array.isArray(todos)) {
      return NextResponse.json(
        {
          success: false,
          error: '할 일 목록 데이터가 올바르지 않습니다.',
          code: 'INVALID_INPUT',
        },
        { status: 400 }
      );
    }

    if (!period || !['today', 'week'].includes(period)) {
      return NextResponse.json(
        {
          success: false,
          error: '분석 기간을 지정해주세요. (today 또는 week)',
          code: 'INVALID_INPUT',
        },
        { status: 400 }
      );
    }

    // 할 일이 없는 경우
    if (todos.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          summary: period === 'today' ? '오늘 등록된 할 일이 없습니다.' : '이번 주 등록된 할 일이 없습니다.',
          urgentTasks: [],
          insights: ['새로운 할 일을 추가하여 계획을 세워보세요!'],
          recommendations: ['AI 기능을 활용하여 할 일을 빠르게 추가할 수 있습니다.'],
        },
      });
    }

    // API 키 확인
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_GENERATIVE_AI_API_KEY가 설정되지 않았습니다.');
      return NextResponse.json(
        {
          success: false,
          error: 'AI 서비스 설정이 완료되지 않았습니다.',
          code: 'AUTH_FAILED',
        },
        { status: 500 }
      );
    }

    // 현재 날짜 정보 (한국 시간 기준)
    const now = new Date();
    const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const currentDate = koreaTime.toISOString().split('T')[0];
    const currentDay = koreaTime.toLocaleDateString('ko-KR', { weekday: 'long' });

    // 할 일 데이터 분석용 텍스트 생성
    const todosText = todos
      .map((todo: Todo, index: number) => {
        const status = todo.completed ? '✅ 완료' : '⬜ 미완료';
        const priority = todo.priority === 'high' ? '🔴 높음' : todo.priority === 'medium' ? '🟡 중간' : '🟢 낮음';
        const dueDate = todo.due_date ? new Date(todo.due_date).toISOString().split('T')[0] : '마감일 없음';
        const category = todo.category.length > 0 ? todo.category.join(', ') : '카테고리 없음';
        
        return `${index + 1}. [${status}] ${todo.title}
   - 우선순위: ${priority}
   - 마감일: ${dueDate}
   - 카테고리: ${category}`;
      })
      .join('\n\n');

    const periodText = period === 'today' ? '오늘' : '이번 주';

    // 통계 계산
    const totalCount = todos.length;
    const completedCount = todos.filter(t => t.completed).length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    const highPriorityCount = todos.filter(t => t.priority === 'high').length;
    const mediumPriorityCount = todos.filter(t => t.priority === 'medium').length;
    const lowPriorityCount = todos.filter(t => t.priority === 'low').length;
    
    const todayDate = new Date(currentDate);
    const overdueTodos = todos.filter(t => {
      if (!t.due_date || t.completed) return false;
      return new Date(t.due_date) < todayDate;
    });
    
    const upcomingTodos = todos.filter(t => {
      if (!t.due_date || t.completed) return false;
      const dueDate = new Date(t.due_date);
      return dueDate >= todayDate && dueDate <= new Date(todayDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    });

    // Gemini API 프롬프트 (개선된 버전)
    const periodSpecificGuidance = period === 'today' 
      ? `**오늘의 요약 특화 분석:**
- 당일 집중해야 할 핵심 작업 식별
- 남은 시간 내 완료 가능한 작업 우선순위 제시
- 오늘 완료하기 어려운 작업은 내일로 연기 제안
- 당일 생산성을 높이는 즉각적인 실행 팁 제공`
      : `**이번 주 요약 특화 분석:**
- 주간 업무 패턴 및 생산성 흐름 분석
- 요일별 작업 분포와 균형도 평가
- 다음 주를 위한 개선 전략 제안
- 주간 목표 달성을 위한 장기적 조언 제공`;

    const prompt = `당신은 생산성 코치이자 데이터 분석 전문가입니다. 사용자의 할 일 목록을 깊이 있게 분석하여 실용적이고 동기부여가 되는 인사이트를 제공하세요.

**📊 기본 정보**
- 현재 날짜: ${currentDate} (${currentDay})
- 분석 기간: ${periodText}
- 전체 할 일: ${totalCount}개
- 완료: ${completedCount}개 (${completionRate}%)
- 미완료: ${totalCount - completedCount}개

**📈 우선순위 분포**
- 높음 🔴: ${highPriorityCount}개
- 중간 🟡: ${mediumPriorityCount}개
- 낮음 🟢: ${lowPriorityCount}개

**⏰ 마감일 현황**
- 지연된 할 일: ${overdueTodos.length}개
- 3일 내 마감: ${upcomingTodos.length}개

**📝 할 일 목록 상세**
${todosText}

${periodSpecificGuidance}

**🎯 분석 가이드**

**1. summary (한 줄 요약)**
- 전체 할 일 개수와 완료율을 자연스럽게 표현
- 긍정적인 톤으로 현재 상황 요약
- 예시: "총 8개의 할 일 중 5개를 완료하셨네요! (62.5% 달성)"

**2. urgentTasks (긴급 작업 배열)**
- 우선순위가 높거나 마감일이 임박한 작업 식별 (최대 5개)
- 지연된 작업 우선 포함
- 할 일 **제목만** 배열로 반환
- 없으면 빈 배열 []

**3. insights (인사이트 배열, 3-5개)**
다음 분석을 **자연스러운 한국어 문장**으로 구성:

a) **완료율 분석**
   - 전체 완료율과 우선순위별 완료 패턴
   - "높은 우선순위 작업의 완료율이 80%로 우수합니다!"
   
b) **시간 관리 분석**
   - 마감일 준수 상황
   - 지연된 작업의 패턴 파악
   - "현재 2개의 작업이 마감일을 넘겼습니다."
   
c) **생산성 패턴**
   - 시간대별 작업 분포 (오전/오후/저녁)
   - 카테고리별 집중도
   - "오후 시간대에 업무가 집중되어 있네요."
   
d) **긍정적 피드백**
   - 사용자가 잘하고 있는 점 강조
   - "꾸준히 할 일을 관리하고 계시네요!"
   
e) **주목할 점**
   - 개선이 필요한 부분을 부드럽게 제시
   - "몇 가지 작업을 재조정하면 더 효율적일 것 같아요."

**4. recommendations (추천 사항 배열, 3-5개)**
**구체적이고 실행 가능한** 조언을 제공:

a) **우선순위 조정**
   - "가장 긴급한 '프로젝트 발표 준비'부터 시작해보세요."
   
b) **시간 관리 팁**
   - "오후 3시에 집중 작업 시간을 확보하는 것을 추천합니다."
   
c) **업무 분산 전략**
   - "내일과 모레에 작업을 나누어 배치하면 부담이 줄어듭니다."
   
d) **휴식 및 균형**
   - "업무 외 개인 시간도 챙기시면 더 좋은 성과를 낼 수 있어요."
   
e) **동기부여**
   - "이미 절반 이상 완료하셨어요! 조금만 더 힘내세요! 💪"

**💡 작성 원칙**
1. **긍정적 톤**: 문제점도 격려하는 방식으로 표현
2. **구체성**: "시간 관리 개선" ❌ → "오후 3시에 집중 시간 확보" ✅
3. **실행 가능성**: 바로 적용할 수 있는 조언
4. **자연스러운 한국어**: 친근하고 대화하듯 작성 (존댓말)
5. **맞춤형 분석**: 실제 데이터를 기반으로 개인화된 조언

**⚠️ 필수 규칙**
- JSON 형식**만** 출력 (설명 텍스트 없이)
- 모든 배열은 반드시 포함 (빈 배열이라도 [])
- 이모지 사용 가능하지만 과도하지 않게
- 문장은 완결된 형태로 (마침표 포함)

**📤 출력 형식 (JSON만 출력):**
{
  "summary": "긍정적이고 자연스러운 한 줄 요약",
  "urgentTasks": ["긴급 작업 제목1", "긴급 작업 제목2"],
  "insights": [
    "완료율 관련 인사이트",
    "시간 관리 인사이트",
    "생산성 패턴 인사이트",
    "긍정적 피드백",
    "주목할 점"
  ],
  "recommendations": [
    "구체적인 우선순위 조정 제안",
    "실행 가능한 시간 관리 팁",
    "업무 분산 전략",
    "휴식 및 균형 조언",
    "동기부여 메시지"
  ]
}`;

    // Gemini API 호출
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API 오류:', errorData);
      
      if (errorData.error?.message?.includes('quota') || errorData.error?.message?.includes('rate limit')) {
        return NextResponse.json(
          {
            success: false,
            error: 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
            code: 'RATE_LIMIT_EXCEEDED',
          },
          { status: 429 }
        );
      }
      
      throw new Error(errorData.error?.message || 'Gemini API 호출 실패');
    }

    const result = await response.json();

    // 응답에서 텍스트 추출
    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      throw new Error('AI 응답을 파싱할 수 없습니다.');
    }

    // JSON 추출 (코드 블록이나 마크다운 제거)
    let jsonText = generatedText.trim();
    jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    // JSON 파싱
    let analysisData: AnalysisResult;
    try {
      analysisData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON 파싱 실패:', jsonText);
      throw new Error('AI가 올바른 형식의 응답을 생성하지 못했습니다.');
    }

    // 데이터 검증 및 기본값 설정
    if (!analysisData.summary) {
      analysisData.summary = `총 ${todos.length}개의 할 일이 있습니다.`;
    }
    
    if (!Array.isArray(analysisData.urgentTasks)) {
      analysisData.urgentTasks = [];
    }
    
    if (!Array.isArray(analysisData.insights) || analysisData.insights.length === 0) {
      analysisData.insights = ['할 일 목록을 꾸준히 관리하고 계시네요!'];
    }
    
    if (!Array.isArray(analysisData.recommendations) || analysisData.recommendations.length === 0) {
      analysisData.recommendations = ['오늘 하루도 화이팅하세요!'];
    }

    return NextResponse.json({
      success: true,
      data: analysisData,
    });
  } catch (error) {
    console.error('AI 분석 오류:', error);

    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      // API 호출 한도 초과
      if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
        return NextResponse.json(
          {
            success: false,
            error: 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
            code: 'RATE_LIMIT_EXCEEDED',
          },
          { status: 429 }
        );
      }

      // 네트워크 오류
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        return NextResponse.json(
          {
            success: false,
            error: 'AI 서비스에 연결할 수 없습니다. 인터넷 연결을 확인하고 다시 시도해주세요.',
            code: 'NETWORK_ERROR',
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: `AI 분석 중 오류가 발생했습니다: ${error.message}`,
          code: 'AI_PROCESSING_ERROR',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: '예상치 못한 오류가 발생했습니다.',
        code: 'UNKNOWN_ERROR',
      },
      { status: 500 }
    );
  }
}

