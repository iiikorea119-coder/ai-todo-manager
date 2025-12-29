# 🤖 AI 할 일 관리 (AI Todo Manager)

AI 기반 자연어 파싱 기능이 있는 스마트 할 일 관리 애플리케이션입니다.

## ✨ 주요 기능

- 🧠 **AI 자연어 파싱**: "내일 오후 3시까지 중요한 팀 회의 준비하기" → 구조화된 할 일로 자동 변환
- 📝 **할 일 관리**: 생성, 수정, 삭제, 완료 처리
- 🎯 **우선순위**: High, Medium, Low 우선순위 설정
- 📅 **마감일**: 날짜 및 시간 설정
- 🏷️ **카테고리**: 업무, 개인, 학습, 건강, 취미 등
- 🔐 **사용자 인증**: Supabase 기반 회원가입/로그인
- 🎨 **모던 UI**: shadcn/ui + Tailwind CSS

## 🛠️ 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**: shadcn/ui
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth
- **AI**: Google Gemini 2.0 Flash (via Vercel AI SDK)

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/ai-todo-manager.git
cd ai-todo-manager
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key

# Google Gemini AI
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
```

자세한 설정 방법은 [환경 변수 설정 가이드](docs/ENV_SETUP.md)를 참조하세요.

### 4. 개발 서버 실행

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📖 사용 방법

### AI로 할 일 생성하기

1. 로그인 후 "새 할 일 추가" 버튼 클릭
2. AI 입력 영역에 자연어로 입력:
   - "내일 오후 3시까지 중요한 팀 회의 준비하기"
   - "다음 주 월요일까지 프로젝트 보고서 작성"
   - "매주 금요일 저녁 7시 운동하기"
3. "AI로 생성" 버튼 클릭 (또는 Ctrl+Enter)
4. AI가 자동으로 파싱한 결과 확인 및 수정
5. "추가" 버튼으로 저장

### 수동으로 할 일 추가하기

1. "수동 입력" 버튼 클릭
2. 제목, 설명, 우선순위, 마감일, 카테고리 직접 입력
3. "추가" 버튼으로 저장

## 🎯 AI 파싱 예시

| 입력 | 파싱 결과 |
|------|-----------|
| "내일 오후 3시까지 중요한 팀 회의 준비하기" | 제목: "팀 회의 준비"<br>마감일: 내일<br>마감시간: 15:00<br>우선순위: High<br>카테고리: ["업무"] |
| "다음 주 월요일 보고서 작성" | 제목: "보고서 작성"<br>마감일: 다음 주 월요일<br>마감시간: 09:00<br>우선순위: Medium<br>카테고리: ["업무"] |
| "주말에 천천히 독서하기" | 제목: "독서하기"<br>우선순위: Low<br>카테고리: ["취미"] |

## 📂 프로젝트 구조

```
ai-todo-manager/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   └── parse-todo/   # AI 파싱 엔드포인트
│   ├── login/            # 로그인 페이지
│   ├── signup/           # 회원가입 페이지
│   └── page.tsx          # 메인 페이지
├── components/            # React 컴포넌트
│   ├── todo/             # 할 일 관련 컴포넌트
│   │   ├── TodoForm.tsx  # 할 일 추가/편집 폼 (AI 기능 포함)
│   │   ├── TodoList.tsx  # 할 일 목록
│   │   └── TodoCard.tsx  # 할 일 카드
│   └── ui/               # shadcn/ui 컴포넌트
├── lib/                   # 유틸리티 및 설정
│   └── supabase/         # Supabase 클라이언트
├── types/                 # TypeScript 타입 정의
│   └── todo.ts           # 할 일 타입 (AI 파싱 포함)
├── docs/                  # 문서
│   └── ENV_SETUP.md      # 환경 변수 설정 가이드
└── supabase/             # 데이터베이스 스키마
    └── schema.sql        # PostgreSQL 스키마
```

## 🔧 개발

### 환경 변수 설정
- [환경 변수 설정 가이드](docs/ENV_SETUP.md)
- [Supabase 설정 가이드](docs/SUPABASE_SETUP.md)

### 데이터베이스 스키마
`supabase/schema.sql` 파일을 Supabase SQL Editor에서 실행하세요.

## 📝 라이선스

MIT License

## 🤝 기여

이슈 및 풀 리퀘스트를 환영합니다!
