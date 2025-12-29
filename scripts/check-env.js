/**
 * 환경 변수 확인 스크립트
 * 
 * 사용 방법:
 * node scripts/check-env.js
 */

console.log('='.repeat(60));
console.log('환경 변수 확인 스크립트');
console.log('='.repeat(60));
console.log('');

// .env.local 파일 확인
const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(process.cwd(), '.env.local');
const envLocalExists = fs.existsSync(envLocalPath);

console.log('📁 .env.local 파일 확인:');
console.log(`   위치: ${envLocalPath}`);
console.log(`   존재 여부: ${envLocalExists ? '✅ 있음' : '❌ 없음'}`);
console.log('');

if (envLocalExists) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  console.log('📝 .env.local 파일 내용:');
  console.log(`   총 ${lines.length}개의 환경 변수 설정`);
  console.log('');
  
  lines.forEach(line => {
    const [key] = line.split('=');
    if (key) {
      console.log(`   - ${key.trim()}`);
    }
  });
  console.log('');
}

// 필수 환경 변수 확인
console.log('🔑 필수 환경 변수 확인:');

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
];

let allPresent = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  const isPresent = !!value;
  
  if (!isPresent) allPresent = false;
  
  console.log(`   ${varName}:`);
  console.log(`     상태: ${isPresent ? '✅ 설정됨' : '❌ 없음'}`);
  
  if (isPresent) {
    // URL은 전체 표시, 키는 일부만 표시
    if (varName.includes('URL')) {
      console.log(`     값: ${value}`);
    } else {
      const masked = value.substring(0, 20) + '...' + value.substring(value.length - 10);
      console.log(`     값: ${masked}`);
      
      // JWT 형식 검증
      if (value.startsWith('eyJ')) {
        console.log(`     형식: ✅ JWT 형식 (올바름)`);
      } else if (value.startsWith('sb_')) {
        console.log(`     형식: ❌ 잘못된 키 (sb_는 올바른 anon key가 아님)`);
        allPresent = false;
      } else {
        console.log(`     형식: ⚠️  의심스러운 형식 (JWT는 eyJ로 시작해야 함)`);
      }
    }
  }
  console.log('');
});

// 결과 요약
console.log('='.repeat(60));
if (allPresent) {
  console.log('✅ 모든 필수 환경 변수가 설정되어 있습니다!');
  console.log('');
  console.log('다음 단계:');
  console.log('1. 개발 서버가 실행 중이라면 재시작하세요 (Ctrl+C 후 npm run dev)');
  console.log('2. 브라우저를 새로고침하세요 (F5)');
  console.log('3. 회원가입을 다시 시도하세요');
} else {
  console.log('❌ 일부 환경 변수가 누락되었습니다!');
  console.log('');
  console.log('해결 방법:');
  console.log('1. 프로젝트 루트에 .env.local 파일을 생성하세요');
  console.log('2. 다음 내용을 추가하세요:');
  console.log('');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=your-project-url');
  console.log('   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key');
  console.log('');
  console.log('3. Supabase 대시보드(Settings > API)에서 값을 복사하세요');
  console.log('4. 개발 서버를 재시작하세요');
  console.log('');
  console.log('자세한 가이드: docs/ENV_SETUP.md');
}
console.log('='.repeat(60));

