# 🚀 Supabase 프로젝트 생성 가이드

## 상황
Supabase 대시보드에 프로젝트가 없거나, 올바른 프로젝트를 찾을 수 없는 경우

## 해결 방법: 새 프로젝트 생성

### 1단계: Supabase 대시보드 접속
```
https://supabase.com/dashboard
```

### 2단계: 새 프로젝트 생성

1. **New project** 버튼 클릭
2. 다음 정보 입력:

```
Organization: 기존 organization 선택 (없으면 새로 생성)
Name: ai-todo-manager
Database Password: 강력한 비밀번호 입력 (꼭 메모해두세요!)
Region: Northeast Asia (Seoul) - ap-northeast-2
Pricing Plan: Free
```

3. **Create new project** 클릭
4. 프로젝트 생성 완료 대기 (1-2분 소요)

### 3단계: API 키 확인

프로젝트가 생성되면:

1. 왼쪽 사이드바 → **Settings** → **API**
2. 다음 값 확인:

```
Project URL
https://xxxxxxxxxxxxx.supabase.co

anon public (이 키를 복사하세요!)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4단계: 데이터베이스 스키마 생성

1. 왼쪽 사이드바 → **SQL Editor**
2. **New query** 클릭
3. 프로젝트의 `supabase/schema.sql` 파일 내용 전체를 복사하여 붙여넣기
4. **Run** 버튼 클릭 (또는 Ctrl+Enter)
5. 성공 메시지 확인: "Success. No rows returned"

### 5단계: .env.local 파일 업데이트

```env
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyCMKabzC_-uRfpuMnvTtDJwVsTL31A1-hw
NEXT_PUBLIC_SUPABASE_URL=새_프로젝트의_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=새_프로젝트의_anon_public_키
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=새_프로젝트의_anon_public_키
```

### 6단계: 개발 서버 재시작

터미널에서:
```bash
# Ctrl+C로 서버 중지
npm run dev
```

### 7단계: 회원가입 테스트

브라우저:
1. `http://localhost:3000/signup` 접속
2. F12로 콘솔 열기
3. 회원가입 시도

---

## ✅ 성공 확인

콘솔에 다음과 같이 표시되면 성공:

```
=== 환경 변수 체크 ===
URL: https://xxxxx.supabase.co ✅
KEY: ✅ 있음
✅ 환경 변수 확인 완료

=== 회원가입 프로세스 시작 ===
✅ Supabase 클라이언트 생성 완료
📤 회원가입 요청 전송 중...
📥 Supabase 응답 수신
✅ 회원가입 성공!
```

---

## 🔒 보안 주의사항

1. **Database Password**는 안전한 곳에 저장하세요
2. **anon public** 키만 클라이언트에서 사용하세요
3. **service_role** 키는 절대 클라이언트에서 사용하지 마세요
4. `.env.local` 파일은 Git에 커밋되지 않습니다 (이미 .gitignore에 포함됨)

---

## 📊 프로젝트 상태 확인

Supabase 대시보드에서:
- **Home**: 프로젝트 상태 (Active)
- **Database**: 테이블 생성 여부 (users, todos)
- **Authentication**: 사용자 목록

