# PRD (Product Requirements Document)
## AI 기반 할 일 관리 서비스

---

## 1. 프로젝트 개요
본 프로젝트는 **AI 기능이 결합된 개인 할 일(To-Do) 관리 서비스**로, 사용자가 할 일을 효율적으로 관리하고 생산성을 높일 수 있도록 지원한다.  
Supabase 기반 인증과 데이터 관리, Google Gemini API를 활용한 AI 기능을 통해 차별화된 사용자 경험을 제공한다.

---

## 2. 목표
- 간단하고 직관적인 할 일 관리 기능 제공
- AI를 활용한 할 일 자동 생성 및 요약/분석 제공
- 확장 가능한 구조로 통계 및 분석 기능까지 고려

---

## 3. 주요 기능

### 3.1 사용자 인증
- 이메일 / 비밀번호 기반 로그인 및 회원가입
- Supabase Auth 활용
- 기능
  - 회원가입
  - 로그인 / 로그아웃
  - 세션 유지

---

### 3.2 할 일 관리 (CRUD)
- 할 일 생성(Create)
- 할 일 조회(Read)
- 할 일 수정(Update)
- 할 일 삭제(Delete)

#### 할 일 데이터 필드
| 필드명 | 타입 | 설명 |
|------|------|------|
| id | UUID | 할 일 고유 ID |
| user_id | UUID | 사용자 ID (users 테이블 참조) |
| title | string | 할 일 제목 |
| description | string | 할 일 상세 설명 |
| created_date | timestamp | 생성일 |
| due_date | timestamp | 마감일 |
| priority | enum | high / medium / low |
| category | string[] | 업무 / 개인 / 학습 등 |
| completed | boolean | 완료 여부 |

---

### 3.3 검색, 필터, 정렬
#### 검색
- 제목(title), 설명(description) 기준 검색

#### 필터
- 우선순위: 높음 / 중간 / 낮음
- 카테고리: 업무 / 개인 / 학습 등
- 상태: 진행 중 / 완료 / 지연

#### 정렬
- 우선순위순
- 마감일순
- 생성일순

---

### 3.4 AI 할 일 생성 기능
- 사용자가 자연어 문장 입력
- AI(Google Gemini API)가 문장을 분석하여 구조화된 할 일 데이터로 변환

#### 입력 예시
> 내일 오전 10시에 팀 회의 준비

#### 변환 결과 예시
```json
{
  "title": "팀 회의 준비",
  "description": "내일 오전 10시에 있을 팀 회의를 위해 자료 작성하기",
  "created_date": "YYYY-MM-DD HH:MM",
  "due_date": "YYYY-MM-DD 10:00",
  "priority": "high",
  "category": ["업무"],
  "completed": false
}
```

---

### 3.5 AI 요약 및 분석 기능
- 버튼 클릭 한 번으로 전체 할 일 분석

#### 제공 기능
- 일일 요약
  - 오늘 완료된 할 일
  - 남은 작업 요약
- 주간 요약
  - 주간 완료율
  - 전체 진행 상황 분석

---

## 4. 화면 구성

### 4.1 로그인 / 회원가입 화면
- 이메일 / 비밀번호 입력
- 회원가입 및 로그인
- 오류 메시지 및 로딩 상태 표시

### 4.2 할 일 관리 메인 화면
- 할 일 목록
- 할 일 추가 버튼
- 검색 입력창
- 필터 및 정렬 옵션
- AI 할 일 생성 입력 영역
- AI 요약 및 분석 버튼

### 4.3 통계 및 분석 화면 (확장)
- 주간/월간 완료율 차트
- 카테고리별 할 일 분포
- 생산성 지표 시각화

---

## 5. 기술 스택

### 프론트엔드
- Next.js
- Tailwind CSS
- shadcn/ui

### 백엔드 / BaaS
- Supabase
  - Auth
  - Database (PostgreSQL)

### AI
- Google Gemini API (AI SDK)

---

## 6. 데이터 구조 (Supabase)

### 6.1 users
- Supabase Auth와 연동
- 주요 필드
  - id (UUID, PK)
  - email
  - created_at

### 6.2 todos
- 사용자별 할 일 관리

```sql
create table todos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  title text not null,
  description text,
  created_date timestamp with time zone default now(),
  due_date timestamp with time zone,
  priority text,
  category text[],
  completed boolean default false
);
```

---

## 7. 비기능 요구사항
- 반응형 UI 지원 (모바일 / 데스크톱)
- 인증 및 데이터 접근 보안 강화 (RLS 적용)
- API 응답 시간 최소화
- 확장성과 유지보수 고려한 구조

---

## 8. 향후 확장 아이디어
- 알림 기능 (마감 임박 알림)
- 캘린더 연동
- 협업(공유 할 일) 기능
- 음성 기반 할 일 등록
