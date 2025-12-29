# 할 일 관리 메인 페이지

AI 할 일 관리 서비스의 메인 대시보드입니다.

## 페이지 구조

```
app/
├── page.tsx           # 메인 대시보드 (할 일 관리)
├── landing/page.tsx   # 랜딩 페이지 (서비스 소개)
├── login/page.tsx     # 로그인
└── signup/page.tsx    # 회원가입
```

## 메인 대시보드 (app/page.tsx)

### 1. Header (상단 헤더)
- **로고**: CheckSquare 아이콘 + "AI 할 일 관리" 텍스트
- **AI 요약 버튼**: AI 기능 빠른 접근
- **사용자 메뉴**: 
  - 아바타 표시
  - 드롭다운: 프로필, 로그아웃

### 2. Sidebar (좌측 사이드바)
- **통계 카드**:
  - 전체 할 일 개수
  - 진행 중 개수
  - 완료 개수
- **할 일 추가 버튼**: 큰 CTA 버튼
- **빠른 액션**:
  - AI로 할 일 생성
  - 주간 요약 보기

### 3. Main Area (메인 영역)
- **페이지 제목**: "내 할 일"
- **TodoList 컴포넌트**:
  - 검색 기능
  - 필터 (우선순위, 상태)
  - 정렬 (생성일, 마감일, 우선순위)
  - 할 일 카드 목록

### 4. TodoForm (다이얼로그)
- **모달 형태**: 화면 중앙에 표시
- **기능**: 할 일 추가/수정

## 주요 기능

### 할 일 관리 (CRUD)
```typescript
// 추가
handleAddTodo(data: CreateTodoRequest)

// 조회
todos: Todo[]

// 수정
handleEdit(todo: Todo)

// 삭제
handleDelete(id: string)
```

### 완료 상태 토글
```typescript
handleToggleComplete(id: string, completed: boolean)
```

### 통계 계산
```typescript
totalTodos: number      // 전체 할 일
completedTodos: number  // 완료된 할 일
pendingTodos: number    // 진행 중 할 일
```

## Mock 데이터

### 사용자 정보
```typescript
const MOCK_USER = {
  name: '홍길동',
  email: 'user@example.com',
  avatar: '',
};
```

### 할 일 목록
```typescript
const MOCK_TODOS: Todo[] = [
  {
    id: '1',
    title: '프로젝트 기획서 작성',
    description: 'Q1 신규 프로젝트 기획서를 작성하고 팀원들과 공유',
    priority: 'high',
    category: ['업무'],
    completed: false,
    // ...
  },
  // ...
];
```

## 레이아웃

### 데스크톱 (lg 이상)
```
┌─────────────────────────────────────────┐
│           Header (로고, 사용자)          │
├──────────┬──────────────────────────────┤
│          │                              │
│  통계    │       내 할 일               │
│          │                              │
│  추가    │   [검색/필터/정렬]           │
│  버튼    │                              │
│          │   [할 일 카드 1]             │
│  빠른    │   [할 일 카드 2]             │
│  액션    │   [할 일 카드 3]             │
│          │   [할 일 카드 4]             │
│          │                              │
└──────────┴──────────────────────────────┘
```

### 모바일 (lg 미만)
```
┌─────────────────────┐
│    Header           │
├─────────────────────┤
│   통계              │
├─────────────────────┤
│   추가 버튼         │
├─────────────────────┤
│   빠른 액션         │
├─────────────────────┤
│   내 할 일          │
│   [할 일 카드 1]    │
│   [할 일 카드 2]    │
│   [할 일 카드 3]    │
└─────────────────────┘
```

## 사용된 컴포넌트

### Shadcn/ui
- `Button`: 버튼
- `Avatar`: 사용자 아바타
- `DropdownMenu`: 드롭다운 메뉴
- `Card`: 통계 카드

### 커스텀 컴포넌트
- `TodoList`: 할 일 목록 (from `@/components/todo`)
- `TodoForm`: 할 일 폼 (from `@/components/todo`)

### 아이콘 (lucide-react)
- `CheckSquare`: 로고
- `LogOut`: 로그아웃
- `Plus`: 추가
- `Sparkles`: AI 기능
- `User`: 사용자

## 상태 관리

```typescript
// 할 일 목록
const [todos, setTodos] = useState<Todo[]>(MOCK_TODOS);

// 폼 열림 상태
const [isFormOpen, setIsFormOpen] = useState(false);

// 수정 중인 할 일
const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
```

## 스타일링

### 브랜드 컬러
- Primary: Blue (#3B82F6)
- Accent: Violet (#8B5CF6)
- Success: Emerald (#10B981)

### 반응형 브레이크포인트
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px

### 레이아웃
- **Grid**: `lg:grid-cols-[350px_1fr]`
- **Gap**: 8 (2rem)
- **Container**: max-width with auto margin

## 향후 구현 예정

### 데이터 연동
- [ ] Supabase 연동
- [ ] 실시간 할 일 동기화
- [ ] 사용자 인증 상태 체크

### AI 기능
- [ ] AI 할 일 생성
- [ ] AI 요약 및 분석
- [ ] 일일/주간 요약

### 추가 기능
- [ ] 알림 기능
- [ ] 카테고리 관리
- [ ] 통계 및 차트
- [ ] 다크 모드 토글

## 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 페이지 접근

- **메인 대시보드**: `http://localhost:3000/`
- **랜딩 페이지**: `http://localhost:3000/landing`
- **로그인**: `http://localhost:3000/login`
- **회원가입**: `http://localhost:3000/signup`

## 테스트

### 할 일 추가
1. "새 할 일 추가" 버튼 클릭
2. 폼에 정보 입력
3. "추가" 버튼 클릭

### 할 일 완료
1. 할 일 카드의 체크박스 클릭
2. 완료 상태 토글

### 할 일 수정
1. 할 일 카드의 수정 버튼 클릭
2. 폼에서 정보 수정
3. "수정" 버튼 클릭

### 할 일 삭제
1. 할 일 카드의 삭제 버튼 클릭
2. 확인 다이얼로그에서 확인

### 검색/필터/정렬
1. TodoList의 검색창에 키워드 입력
2. 필터 드롭다운에서 조건 선택
3. 정렬 드롭다운에서 기준 선택

## 주의사항

1. **Mock 데이터**: 현재는 임시 데이터 사용 중
2. **로그아웃**: 실제 로그아웃 로직 미구현
3. **AI 기능**: UI만 구현, 실제 기능 미구현
4. **인증**: 사용자 인증 체크 미구현

## 개발 규칙 준수

✅ **함수형 컴포넌트** - 화살표 함수 사용  
✅ **한글 주석** - JSDoc 한글 주석  
✅ **TypeScript** - 명시적 타입 정의  
✅ **Tailwind CSS** - 모든 스타일링  
✅ **Shadcn/ui** - UI 컴포넌트  
✅ **반응형 디자인** - 모바일/데스크톱  

## 참고 자료

- [PRD 문서](../docs/PRD.md)
- [프로젝트 규칙](.cursor/rules/project-rules.mdc)
- [Todo 컴포넌트](../components/todo/README.md)

