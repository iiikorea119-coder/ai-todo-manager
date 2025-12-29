# 🔑 Supabase API 키 가져오기

## 🎯 문제
현재 `.env.local` 파일에 있는 API 키가 올바르지 않을 수 있습니다.

## ✅ 해결 방법: Supabase 대시보드에서 실제 키 가져오기

### 1단계: Supabase 대시보드 접속

1. 브라우저에서 [https://supabase.com/dashboard](https://supabase.com/dashboard) 접속
2. 로그인

### 2단계: 프로젝트 선택

- 프로젝트 이름: **ai-todo-manager** 또는 유사한 이름
- Project URL이 `https://uyjqbdyrbdsiydyjslus.supabase.co`와 일치하는지 확인

### 3단계: API 설정 페이지로 이동

1. 왼쪽 사이드바에서 **⚙️ Settings** 클릭
2. **API** 메뉴 클릭

### 4단계: API 키 복사

다음 두 가지 값을 복사하세요:

#### Project URL
```
https://uyjqbdyrbdsiydyjslus.supabase.co
```
→ 이 값은 이미 맞습니다 ✅

#### anon public 키
```
섹션: Project API keys
키 이름: anon public
```

이 키는 다음과 같이 시작합니다:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

**⚠️ 중요: service_role 키가 아닌 anon public 키를 복사하세요!**

### 5단계: .env.local 파일 업데이트

프로젝트 루트의 `.env.local` 파일을 다음과 같이 수정하세요:

```env
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyCMKabzC_-uRfpuMnvTtDJwVsTL31A1-hw
NEXT_PUBLIC_SUPABASE_URL=https://uyjqbdyrbdsiydyjslus.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_복사한_anon_public_키_붙여넣기
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=여기에_복사한_anon_public_키_붙여넣기
```

**주의사항:**
- ❌ 등호(`=`) 주변에 공백을 넣지 마세요
- ❌ 키를 따옴표로 감싸지 마세요
- ✅ 키를 그대로 복사-붙여넣기 하세요

### 6단계: 개발 서버 재시작

터미널에서:

```bash
# Ctrl + C로 서버 중지

# 서버 재시작
npm run dev
```

### 7단계: 브라우저 새로고침

- F5 키를 눌러 페이지 새로고침
- 회원가입 재시도

---

## 🛠️ 빠른 테스트

환경 변수가 올바르게 설정되었는지 확인:

```bash
node scripts/check-env.js
```

다음과 같이 표시되어야 합니다:

```
🔑 필수 환경 변수 확인:
   NEXT_PUBLIC_SUPABASE_URL:
     상태: ✅ 설정됨
     값: https://uyjqbdyrbdsiydyjslus.supabase.co

   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
     상태: ✅ 설정됨
     값: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📸 스크린샷 가이드

Supabase 대시보드 → Settings → API 페이지에서:

```
┌─────────────────────────────────────────────────────────┐
│ Project API keys                                        │
├─────────────────────────────────────────────────────────┤
│ Project URL                                             │
│ https://uyjqbdyrbdsiydyjslus.supabase.co               │
│ [Copy]                                                  │
│                                                         │
│ anon public                                            │
│ This key is safe to use in a browser if you have       │
│ enabled Row Level Security for your tables...          │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...       │
│ [Copy] ← 이 버튼 클릭!                                   │
│                                                         │
│ service_role secret                                    │
│ This key has the ability to bypass Row Level...       │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...       │
│ [Reveal] [Copy] ← 이 키는 사용하지 마세요!              │
└─────────────────────────────────────────────────────────┘
```

---

## ❓ 프로젝트가 없나요?

프로젝트가 없다면 새로 생성하세요:

1. Supabase 대시보드 → **New project**
2. 프로젝트 이름: `ai-todo-manager`
3. Database Password: 강력한 비밀번호 입력 (저장해두세요!)
4. Region: `Northeast Asia (Seoul)` 선택
5. **Create new project** 클릭
6. 프로젝트 생성 완료될 때까지 대기 (1-2분)
7. Settings → API에서 키 복사

---

## 🔒 보안 주의사항

- ✅ **anon public** 키는 클라이언트에서 사용 (안전)
- ❌ **service_role** 키는 절대 클라이언트에서 사용하지 마세요 (위험!)
- ✅ `.env.local` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다

---

**이 단계를 완료한 후 회원가입을 다시 시도해주세요!**

