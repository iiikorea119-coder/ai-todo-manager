# 문제 해결 가이드

회원가입/로그인 시 발생할 수 있는 문제들과 해결 방법입니다.

## 🚨 "회원가입에 실패했습니다. 다시 시도해주세요."

### 증상
- 회원가입 버튼을 클릭하면 일반적인 에러 메시지만 표시됨
- 콘솔에 `회원가입 실패 상세: {}` 같은 빈 객체가 표시됨

### 원인
가장 흔한 원인은 **환경 변수가 설정되지 않았거나 잘못 설정된 경우**입니다.

### 해결 방법

#### 1단계: 환경 변수 자동 확인

터미널에서 다음 명령어를 실행하세요:

```bash
node scripts/check-env.js
```

이 스크립트는 자동으로:
- ✅ `.env.local` 파일 존재 여부 확인
- ✅ 필수 환경 변수 설정 여부 확인
- ✅ 문제 해결 방법 안내

#### 2단계: 브라우저 콘솔 확인

1. 회원가입 페이지 접속: `http://localhost:3000/signup`
2. **F12** 키를 눌러 개발자 도구 열기
3. **Console** 탭 선택
4. 페이지 새로고침 (F5)
5. 다음 메시지 확인:

```
=== Supabase 환경 변수 확인 ===
NEXT_PUBLIC_SUPABASE_URL: ❌ 설정 안됨  ← 문제!
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ❌ 설정 안됨  ← 문제!
```

#### 3단계: .env.local 파일 생성

**❌ 환경 변수가 설정 안됨**으로 나오면:

1. 프로젝트 루트 디렉토리로 이동
2. `.env.local` 파일 생성:

```bash
# Windows PowerShell
New-Item -Path .env.local -ItemType File

# Mac/Linux
touch .env.local
```

3. 파일에 다음 내용 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 4단계: Supabase에서 실제 값 가져오기

1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 (없으면 새로 생성)
3. **Settings** → **API** 메뉴
4. 다음 값 복사:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`에 붙여넣기
   - **anon public** 키 → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`에 붙여넣기

#### 5단계: 개발 서버 재시작

**중요!** 환경 변수는 서버 재시작 후에만 적용됩니다.

```bash
# 1. 현재 서버 중지 (Ctrl + C)

# 2. 서버 재시작
npm run dev
```

#### 6단계: 브라우저 새로고침

- **F5** 키를 눌러 페이지 새로고침
- 콘솔에서 환경 변수가 설정되었는지 확인:

```
=== Supabase 환경 변수 확인 ===
NEXT_PUBLIC_SUPABASE_URL: https://xxxxx.supabase.co ✅
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ✅ 설정됨
```

#### 7단계: 회원가입 재시도

이제 회원가입을 다시 시도하면 더 상세한 에러 메시지를 볼 수 있습니다.

## 🔍 상세 디버깅

### 콘솔에서 확인할 수 있는 로그

회원가입 시도 시 콘솔에 다음과 같은 로그가 표시됩니다:

```
=== 환경 변수 체크 ===
URL: https://xxxxx.supabase.co ✅
KEY: ✅ 있음
✅ 환경 변수 확인 완료

=== 회원가입 프로세스 시작 ===
입력 데이터: { email: 'test@example.com', name: '홍길동' }
✅ Supabase 클라이언트 생성 완료
📤 회원가입 요청 전송 중...
📥 Supabase 응답 수신
✅ 회원가입 성공!
```

### 각 단계별 에러 확인

#### "URL: ❌ 없음" 또는 "KEY: ❌ 없음"
→ `.env.local` 파일이 없거나 환경 변수 이름이 틀렸습니다.

#### "Supabase 클라이언트 생성 완료" 이후 에러
→ 네트워크 문제이거나 Supabase URL/키가 잘못되었습니다.

#### "❌ Supabase 회원가입 에러 발생!"
→ 콘솔에 표시된 에러 메시지를 확인하세요.

## 📋 체크리스트

문제 해결 전에 다음을 확인하세요:

- [ ] `.env.local` 파일이 프로젝트 루트에 있는가?
- [ ] 파일 이름이 정확한가? (`.env.local`, 대소문자 정확히)
- [ ] 환경 변수 이름에 `NEXT_PUBLIC_` 접두사가 있는가?
- [ ] Supabase 프로젝트가 생성되어 있는가?
- [ ] Supabase 대시보드에서 URL과 키를 복사했는가?
- [ ] 개발 서버를 재시작했는가?
- [ ] 브라우저를 새로고침했는가?

## 🛠️ 추가 도구

### 환경 변수 확인 스크립트

```bash
node scripts/check-env.js
```

자동으로 환경 변수를 확인하고 문제를 진단합니다.

### 브라우저 콘솔

F12 → Console 탭에서 실시간으로 에러를 확인할 수 있습니다.

## 📚 관련 문서

- [환경 변수 설정 가이드](./docs/ENV_SETUP.md)
- [Supabase 초기 설정](./docs/SUPABASE_SETUP.md)

## 💬 여전히 문제가 해결되지 않나요?

다음 정보를 포함하여 질문해주세요:

1. **브라우저 콘솔 로그** (F12 → Console)
2. **환경 변수 확인 스크립트 결과**
3. **발생한 에러 메시지**
4. **시도한 해결 방법**

---

**빠른 요약:**

```bash
# 1. 환경 변수 확인
node scripts/check-env.js

# 2. .env.local 파일 생성 (없다면)
# 3. Supabase URL과 키 입력
# 4. 서버 재시작
npm run dev

# 5. 브라우저 새로고침 후 재시도
```

