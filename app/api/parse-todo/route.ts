/**
 * AI 기반 자연어 할 일 파싱 API
 * Gemini API를 사용하여 자연어 입력을 구조화된 데이터로 변환
 */
import { NextRequest, NextResponse } from 'next/server';

interface ParsedTodo {
  title: string;
  description?: string;
  due_date?: string;
  due_time?: string;
  priority: 'high' | 'medium' | 'low';
  category: string[];
}

/**
 * 단일 할 일 텍스트를 AI로 파싱하는 헬퍼 함수
 */
async function parseSingleTodo(text: string, apiKey: string): Promise<ParsedTodo> {
  // 현재 날짜 정보 (한국 시간 기준)
  const now = new Date();
  const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const currentDate = koreaTime.toISOString().split('T')[0];
  const currentDay = koreaTime.toLocaleDateString('ko-KR', { weekday: 'long' });
  
  // 날짜 계산 헬퍼
  const tomorrow = new Date(koreaTime);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split('T')[0];
  
  const dayAfterTomorrow = new Date(koreaTime);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  const dayAfterTomorrowDate = dayAfterTomorrow.toISOString().split('T')[0];
  
  // N일 후 계산 (1일 후부터 7일 후까지)
  const daysLater: { [key: string]: string } = {};
  for (let i = 1; i <= 7; i++) {
    const futureDate = new Date(koreaTime);
    futureDate.setDate(futureDate.getDate() + i);
    daysLater[`${i}일후`] = futureDate.toISOString().split('T')[0];
  }
  
  // 일주일 후, 2주 후 등
  const oneWeekLater = new Date(koreaTime);
  oneWeekLater.setDate(oneWeekLater.getDate() + 7);
  const oneWeekLaterDate = oneWeekLater.toISOString().split('T')[0];
  
  const twoWeeksLater = new Date(koreaTime);
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
  const twoWeeksLaterDate = twoWeeksLater.toISOString().split('T')[0];
  
  // 한달 후 (30일 기준)
  const oneMonthLater = new Date(koreaTime);
  oneMonthLater.setDate(oneMonthLater.getDate() + 30);
  const oneMonthLaterDate = oneMonthLater.toISOString().split('T')[0];
  
  // 다음 주 월요일 계산
  const nextMonday = new Date(koreaTime);
  const daysUntilMonday = (8 - nextMonday.getDay()) % 7 || 7;
  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
  const nextMondayDate = nextMonday.toISOString().split('T')[0];

  // Gemini API 프롬프트 (개선된 버전)
  const prompt = `당신은 할 일을 구조화하는 AI 전문가입니다. 사용자의 자연어 입력을 분석하여 정확한 JSON 형식으로 할 일 데이터를 생성하세요.

**📅 현재 날짜 정보:**
- 오늘: ${currentDate} (${currentDay})
- 내일: ${tomorrowDate}
- 모레: ${dayAfterTomorrowDate}
- 1일 후: ${daysLater['1일후']}
- 2일 후: ${daysLater['2일후']}
- 3일 후: ${daysLater['3일후']}
- 4일 후: ${daysLater['4일후']}
- 5일 후: ${daysLater['5일후']}
- 6일 후: ${daysLater['6일후']}
- 7일 후 (일주일 후): ${oneWeekLaterDate}
- 2주 후: ${twoWeeksLaterDate}
- 한달 후: ${oneMonthLaterDate}
- 다음 주 월요일: ${nextMondayDate}

**📝 입력 텍스트:**
"${text}"

**🎯 분석 규칙 (반드시 준수):**

**1. 제목 (title) - 필수**
- 핵심 행동만 간결하게 추출
- 예시: "팀 회의 준비", "보고서 작성", "운동하기"

**2. 설명 (description) - 선택**
- 제목에 포함되지 않은 추가 정보나 세부사항
- **시간 정보가 있으면 자연스럽게 포함** (예: "오후 3시에 진행", "저녁 7시 약속")
- 날짜나 장소 등 추가 맥락 정보
- 없으면 생략 가능

**3. 마감일 (due_date) - 선택, YYYY-MM-DD 형식**
날짜 표현 변환 규칙 (반드시 정확하게 계산):
- "오늘" → ${currentDate}
- "내일" → ${tomorrowDate}
- "모레" → ${dayAfterTomorrowDate}
- "1일 후", "하루 후" → ${daysLater['1일후']}
- "2일 후", "이틀 후" → ${daysLater['2일후']}
- "3일 후", "사흘 후" → ${daysLater['3일후']}
- "4일 후" → ${daysLater['4일후']}
- "5일 후" → ${daysLater['5일후']}
- "6일 후" → ${daysLater['6일후']}
- "7일 후", "일주일 후", "1주일 후" → ${oneWeekLaterDate}
- "2주 후", "2주일 후" → ${twoWeeksLaterDate}
- "한달 후", "1달 후", "1개월 후" → ${oneMonthLaterDate}
- "다음 주 월요일" → ${nextMondayDate}
- "월요일", "화요일" 등 → 가장 가까운 해당 요일
- 날짜 언급 없으면 생략

**⚠️ 중요: "N일 후" 표현은 위의 계산된 날짜를 정확히 사용하세요!**

**4. 마감시간 (due_time) - 선택, HH:MM 형식 (24시간제)**
시간 표현 변환 규칙:
- "아침" → "09:00"
- "점심" → "12:00"
- "오후" → "14:00"
- "저녁" → "18:00"
- "밤" → "21:00"
- "오후 3시", "15시" → "15:00"
- "저녁 7시", "19시" → "19:00"
- 시간 언급 없고 마감일만 있으면 → "09:00" (기본값)
- 마감일도 없으면 생략

**5. 우선순위 (priority) - 필수**
키워드 기반 판단:
- **"high"**: "급하게", "중요한", "빨리", "꼭", "반드시", "긴급" 포함 시
- **"medium"**: 특별한 키워드 없거나 "보통", "적당히" 포함 시 (기본값)
- **"low"**: "여유롭게", "천천히", "언젠가", "나중에" 포함 시

**6. 카테고리 (category) - 필수, 배열 형식**
키워드 기반 분류 (복수 선택 가능):
- **["업무"]**: "회의", "보고서", "프로젝트", "업무", "일", "팀" 포함 시
- **["개인"]**: "쇼핑", "친구", "가족", "개인", "약속" 포함 시
- **["건강"]**: "운동", "병원", "건강", "요가", "헬스", "조깅" 포함 시
- **["학습"]**: "공부", "책", "강의", "학습", "독서", "코스" 포함 시
- **["취미"]**: "영화", "게임", "여행", "취미" 포함 시
- **["기타"]**: 위 카테고리에 해당하지 않을 때

**⚠️ 중요 지침:**
1. 입력에 명시되지 않은 정보는 생략하세요 (추측하지 마세요)
2. JSON 형식만 출력하고 다른 텍스트는 절대 포함하지 마세요
3. 모든 필드는 소문자로 작성하세요
4. category는 반드시 배열 형식입니다

**📤 출력 형식 (JSON만 출력):**
{
  "title": "할 일 제목",
  "description": "상세 설명 (선택, 시간 정보 포함 가능. 예: '오후 3시에 진행')",
  "due_date": "YYYY-MM-DD (선택)",
  "due_time": "HH:MM (선택)",
  "priority": "high|medium|low",
  "category": ["카테고리1", "카테고리2"]
}

**예시 1: "내일 오후 3시 팀 회의 준비"**
{
  "title": "팀 회의 준비",
  "description": "오후 3시에 진행",
  "due_date": "${tomorrowDate}",
  "due_time": "15:00",
  "priority": "medium",
  "category": ["업무"]
}

**예시 2: "모레 저녁 7시 친구랑 저녁 약속"**
{
  "title": "친구랑 저녁 약속",
  "description": "저녁 7시 약속",
  "due_date": "${dayAfterTomorrowDate}",
  "due_time": "19:00",
  "priority": "medium",
  "category": ["개인"]
}

**예시 3: "3일 후 오후 2시에 병원 예약"**
{
  "title": "병원 예약",
  "description": "오후 2시 진료",
  "due_date": "${daysLater['3일후']}",
  "due_time": "14:00",
  "priority": "high",
  "category": ["건강"]
}

**예시 4: "일주일 후에 프로젝트 발표 준비"**
{
  "title": "프로젝트 발표 준비",
  "due_date": "${oneWeekLaterDate}",
  "due_time": "09:00",
  "priority": "high",
  "category": ["업무"]
}`;

  // Gemini API 호출 (v1beta API 사용, gemini-2.5-flash)
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
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Gemini API 오류:', errorData);
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
  let parsedData: ParsedTodo;
  try {
    parsedData = JSON.parse(jsonText);
  } catch (parseError) {
    console.error('JSON 파싱 실패:', jsonText);
    throw new Error('AI가 올바른 형식의 응답을 생성하지 못했습니다. 다시 시도해주세요.');
  }

  // 후처리 및 검증
  // 필수 필드 검증 및 기본값 설정
  if (!parsedData.title || parsedData.title.trim().length === 0) {
    parsedData.title = text.substring(0, 50); // 입력의 첫 50자를 제목으로 사용
  }
  
  // 제목 길이 조정 (최대 100자)
  if (parsedData.title.length > 100) {
    parsedData.title = parsedData.title.substring(0, 97) + '...';
  }
  
  // 제목 최소 길이 검증 (최소 2자)
  if (parsedData.title.length < 2) {
    parsedData.title = text.substring(0, Math.min(50, text.length));
  }
  
  // 우선순위 기본값
  if (!parsedData.priority || !['high', 'medium', 'low'].includes(parsedData.priority)) {
    parsedData.priority = 'medium';
  }
  
  // 카테고리 기본값
  if (!parsedData.category || !Array.isArray(parsedData.category) || parsedData.category.length === 0) {
    parsedData.category = ['기타'];
  }
  
  // 날짜 검증 - 과거 날짜인지 확인
  if (parsedData.due_date) {
    const dueDate = new Date(parsedData.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dueDate < today) {
      console.warn('과거 날짜 감지:', parsedData.due_date);
      // 과거 날짜는 제거하지 않고 경고만 로깅 (사용자가 의도적으로 설정했을 수 있음)
    }
    
    // 날짜 형식 검증 (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(parsedData.due_date)) {
      console.warn('잘못된 날짜 형식:', parsedData.due_date);
      delete parsedData.due_date;
      delete parsedData.due_time;
    }
  }
  
  // 시간 검증 (HH:MM 형식)
  if (parsedData.due_time) {
    if (!/^\d{2}:\d{2}$/.test(parsedData.due_time)) {
      console.warn('잘못된 시간 형식:', parsedData.due_time);
      delete parsedData.due_time;
    }
  }
  
  // 설명 길이 제한 (최대 1000자)
  if (parsedData.description && parsedData.description.length > 1000) {
    parsedData.description = parsedData.description.substring(0, 997) + '...';
  }

  return parsedData;
}

export async function POST(req: NextRequest) {
  try {
    // 요청 본문 파싱
    const body = await req.json();
    let { text } = body;

    // 1. 입력 검증
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: '텍스트를 입력해주세요.',
        },
        { status: 400 }
      );
    }

    // 2. 전처리
    // 앞뒤 공백 제거
    text = text.trim();
    
    // 연속된 공백을 하나로 통합
    text = text.replace(/\s+/g, ' ');
    
    // 쉼표로 구분된 여러 할 일 감지
    const todoTexts = text.split(',').map(t => t.trim()).filter(t => t.length > 0);
    const isMultipleTodos = todoTexts.length > 1;
    
    // 여러 할 일이 입력된 경우 각각 검증
    if (isMultipleTodos) {
      // 각 할 일이 최소 2자 이상인지 검증
      for (const todoText of todoTexts) {
        if (todoText.length < 2) {
          return NextResponse.json(
            {
              success: false,
              error: '각 할 일은 최소 2자 이상 입력해주세요.',
            },
            { status: 400 }
          );
        }
      }
      
      // 너무 많은 할 일은 제한 (최대 10개)
      if (todoTexts.length > 10) {
        return NextResponse.json(
          {
            success: false,
            error: '한 번에 최대 10개까지만 추가할 수 있습니다.',
          },
          { status: 400 }
        );
      }
    } else {
      // 단일 할 일의 최소 길이 검증 (2자)
      if (text.length < 2) {
        return NextResponse.json(
          {
            success: false,
            error: '할 일은 최소 2자 이상 입력해주세요.',
          },
          { status: 400 }
        );
      }
    }
    
    // 최대 길이 검증 (500자)
    if (text.length > 500) {
      return NextResponse.json(
        {
          success: false,
          error: '할 일은 최대 500자까지 입력 가능합니다. (현재: ' + text.length + '자)',
        },
        { status: 400 }
      );
    }
    
    // 이모지 검증 (차단)
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/u;
    if (emojiRegex.test(text)) {
      return NextResponse.json(
        {
          success: false,
          error: '허용되지 않은 입력입니다. 이모지를 제거하고 다시 시도해주세요.',
          code: 'INVALID_INPUT',
        },
        { status: 400 }
      );
    }
    
    // 의미없는 문자열 검증
    // 1. 숫자만으로 이루어진 경우
    if (/^\d+$/.test(text)) {
      return NextResponse.json(
        {
          success: false,
          error: '잘못된 입력입니다. 의미 있는 할 일을 입력해주세요.',
          code: 'INVALID_INPUT',
        },
        { status: 400 }
      );
    }
    
    // 2. 연속된 같은 문자 (3개 이상 반복)
    if (/(.)\1{2,}/.test(text)) {
      return NextResponse.json(
        {
          success: false,
          error: '잘못된 입력입니다. 의미 있는 할 일을 입력해주세요.',
          code: 'INVALID_INPUT',
        },
        { status: 400 }
      );
    }
    
    // 3. 키보드 연타 패턴 감지
    const keyboardPatterns = [
      'qwer', 'asdf', 'zxcv', 'qaz', 'wsx', 'edc',
      'ㅂㅈㄷㄱ', 'ㅁㄴㅇㄹ', 'ㅋㅌㅊㅍ',
      '1234', '5678', '9012'
    ];
    
    const lowerText = text.toLowerCase();
    if (keyboardPatterns.some(pattern => lowerText.includes(pattern))) {
      return NextResponse.json(
        {
          success: false,
          error: '잘못된 입력입니다. 의미 있는 할 일을 입력해주세요.',
          code: 'INVALID_INPUT',
        },
        { status: 400 }
      );
    }
    
    // 4. 한글 자음/모음만 있는 경우
    if (/^[ㄱ-ㅎㅏ-ㅣ]+$/.test(text)) {
      return NextResponse.json(
        {
          success: false,
          error: '잘못된 입력입니다. 완성된 문장을 입력해주세요.',
          code: 'INVALID_INPUT',
        },
        { status: 400 }
      );
    }
    
    // 5. 과거 날짜 키워드 감지
    const pastDateKeywords = [
      '어제', '그제', '그저께', '엊그제',
      '지난주', '지난달', '지난해', '작년',
      'yesterday', 'last week', 'last month', 'last year'
    ];
    
    if (pastDateKeywords.some(keyword => text.includes(keyword))) {
      return NextResponse.json(
        {
          success: false,
          error: '과거 날짜는 사용할 수 없습니다. 오늘 이후의 날짜를 입력해주세요.',
          code: 'PAST_DATE_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    // API 키 확인
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_GENERATIVE_AI_API_KEY가 설정되지 않았습니다.');
      return NextResponse.json(
        {
          success: false,
          error: 'AI 서비스 설정이 완료되지 않았습니다.',
        },
        { status: 500 }
      );
    }

    // 여러 할 일을 파싱하는 경우
    if (isMultipleTodos) {
      console.log(`📝 여러 할 일 파싱 시작 (${todoTexts.length}개):`, todoTexts);
      
      try {
        // 각 할 일을 병렬로 파싱
        const parsedTodos = await Promise.all(
          todoTexts.map(todoText => parseSingleTodo(todoText, apiKey))
        );
        
        console.log('✅ 여러 할 일 파싱 완료:', parsedTodos.length, '개');
        
        return NextResponse.json({
          success: true,
          multiple: true,
          items: parsedTodos,
        });
      } catch (error) {
        console.error('여러 할 일 파싱 중 오류:', error);
        // 오류 처리는 하단의 catch 블록에서 처리
        throw error;
      }
    }
    
    // 단일 할 일을 파싱하는 경우 (기존 로직)
    console.log('📝 단일 할 일 파싱 시작:', text);
    
    const parsedData = await parseSingleTodo(text, apiKey);
    
    console.log('✅ 단일 할 일 파싱 완료:', parsedData.title);

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.error('AI 파싱 오류:', error);

    // 4. 오류 응답 처리
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      // API 호출 한도 초과 (429)
      if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
        return NextResponse.json(
          {
            success: false,
            error: 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
            code: 'RATE_LIMIT_EXCEEDED',
          },
          { status: 429 }
        );
      }
      
      // API 키 오류
      if (errorMessage.includes('api key') || errorMessage.includes('unauthorized') || errorMessage.includes('forbidden')) {
        return NextResponse.json(
          {
            success: false,
            error: 'AI 서비스 인증에 실패했습니다. 관리자에게 문의해주세요.',
            code: 'AUTH_FAILED',
          },
          { status: 500 }
        );
      }
      
      // 네트워크 오류
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('timeout')) {
        return NextResponse.json(
          {
            success: false,
            error: 'AI 서비스에 연결할 수 없습니다. 인터넷 연결을 확인하고 다시 시도해주세요.',
            code: 'NETWORK_ERROR',
          },
          { status: 500 }
        );
      }
      
      // JSON 파싱 오류
      if (errorMessage.includes('json') || errorMessage.includes('parse')) {
        return NextResponse.json(
          {
            success: false,
            error: 'AI 응답을 처리하는 중 오류가 발생했습니다. 입력을 조금 다르게 표현해보세요.',
            code: 'PARSING_ERROR',
          },
          { status: 500 }
        );
      }
      
      // 일반 AI 처리 오류
      return NextResponse.json(
        {
          success: false,
          error: `AI 처리 중 오류가 발생했습니다: ${error.message}`,
          code: 'AI_PROCESSING_ERROR',
        },
        { status: 500 }
      );
    }

    // 예상치 못한 오류
    return NextResponse.json(
      {
        success: false,
        error: '예상치 못한 오류가 발생했습니다. 다시 시도해주세요.',
        code: 'UNKNOWN_ERROR',
      },
      { status: 500 }
    );
  }
}

