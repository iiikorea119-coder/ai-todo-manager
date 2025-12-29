-- =====================================================
-- AI 할 일 관리 서비스 - 샘플 데이터 (시드 데이터)
-- =====================================================
-- 
-- 이 파일은 개발 및 테스트 환경에서만 사용하세요.
-- 프로덕션 환경에서는 실행하지 마세요!
-- 
-- 사용 방법:
-- 1. 먼저 schema.sql을 실행하여 테이블 생성
-- 2. 회원가입을 통해 실제 사용자 계정 생성
-- 3. 아래 쿼리의 user_id를 실제 사용자 ID로 변경
-- 4. SQL Editor에서 이 파일을 실행
-- 
-- =====================================================

-- =====================================================
-- 주의: 실제 사용자 ID로 변경 필요!
-- =====================================================
-- 
-- 1. 회원가입 후 Supabase 대시보드에서
-- 2. Authentication > Users 메뉴로 이동
-- 3. 사용자 ID 복사
-- 4. 아래의 'YOUR-USER-ID-HERE'를 실제 ID로 변경
-- 
-- =====================================================

DO $$
DECLARE
  demo_user_id UUID := 'YOUR-USER-ID-HERE'::UUID; -- 실제 사용자 ID로 변경!
BEGIN
  -- 사용자 ID가 유효한지 확인
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = demo_user_id) THEN
    RAISE EXCEPTION '사용자 ID가 존재하지 않습니다. 먼저 회원가입을 하고 실제 사용자 ID로 변경하세요.';
  END IF;

  -- =====================================================
  -- 샘플 할 일 데이터 삽입
  -- =====================================================

  -- 높은 우선순위 할 일 (업무)
  INSERT INTO public.todos (user_id, title, description, priority, category, completed, created_date, due_date)
  VALUES
    (demo_user_id, '프로젝트 기획서 작성', 'Q1 신규 프로젝트 기획서를 작성하고 팀원들과 공유', 'high', ARRAY['업무'], false, NOW() - INTERVAL '2 days', NOW() + INTERVAL '3 days'),
    (demo_user_id, '클라이언트 미팅 준비', '주요 고객사와의 미팅을 위한 프레젠테이션 자료 준비', 'high', ARRAY['업무'], false, NOW() - INTERVAL '1 day', NOW() + INTERVAL '1 day');

  -- 중간 우선순위 할 일 (학습)
  INSERT INTO public.todos (user_id, title, description, priority, category, completed, created_date, due_date)
  VALUES
    (demo_user_id, 'Next.js 공부하기', 'App Router와 Server Components 개념 학습', 'medium', ARRAY['학습', '개인'], false, NOW() - INTERVAL '3 days', NOW() + INTERVAL '7 days'),
    (demo_user_id, 'TypeScript 심화 학습', '제네릭과 유틸리티 타입 마스터하기', 'medium', ARRAY['학습'], false, NOW() - INTERVAL '5 days', NOW() + INTERVAL '10 days');

  -- 중간 우선순위 할 일 (건강)
  INSERT INTO public.todos (user_id, title, description, priority, category, completed, created_date, due_date)
  VALUES
    (demo_user_id, '운동 30분', '헬스장에서 유산소 및 근력 운동', 'medium', ARRAY['건강'], true, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
    (demo_user_id, '요가 클래스 등록', '주말 오전 요가 수업 등록하기', 'medium', ARRAY['건강', '개인'], false, NOW(), NOW() + INTERVAL '2 days');

  -- 낮은 우선순위 할 일 (개인)
  INSERT INTO public.todos (user_id, title, description, priority, category, completed, created_date, due_date)
  VALUES
    (demo_user_id, '장보기', '주말 식재료 구입 (우유, 계란, 야채)', 'low', ARRAY['개인'], true, NOW() - INTERVAL '2 days', NULL),
    (demo_user_id, '책 읽기', '이번 달 목표 도서 완독하기', 'low', ARRAY['개인', '취미'], false, NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days'),
    (demo_user_id, '정리 정돈', '방 청소 및 옷장 정리', 'low', ARRAY['개인'], false, NOW() - INTERVAL '1 day', NULL);

  -- 완료된 할 일들
  INSERT INTO public.todos (user_id, title, description, priority, category, completed, created_date, due_date)
  VALUES
    (demo_user_id, '월간 보고서 작성', '지난달 성과 보고서 작성 및 제출', 'high', ARRAY['업무'], true, NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days'),
    (demo_user_id, '팀 회의 참석', '주간 팀 회의 참석 및 진행 상황 공유', 'medium', ARRAY['업무'], true, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
    (demo_user_id, '이메일 답장', '밀린 이메일 답장하기', 'low', ARRAY['업무'], true, NOW() - INTERVAL '1 day', NULL);

  -- 지연된 할 일 (마감일이 지남)
  INSERT INTO public.todos (user_id, title, description, priority, category, completed, created_date, due_date)
  VALUES
    (demo_user_id, '세금 신고', '연말정산 서류 준비 및 제출', 'high', ARRAY['개인'], false, NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days');

  RAISE NOTICE '샘플 데이터가 성공적으로 삽입되었습니다!';
  RAISE NOTICE '총 13개의 할 일이 생성되었습니다.';
  
END $$;

-- =====================================================
-- 데이터 확인
-- =====================================================

-- 삽입된 데이터 확인
SELECT 
  COUNT(*) AS total_todos,
  SUM(CASE WHEN completed THEN 1 ELSE 0 END) AS completed,
  SUM(CASE WHEN NOT completed THEN 1 ELSE 0 END) AS pending,
  SUM(CASE WHEN NOT completed AND due_date < NOW() THEN 1 ELSE 0 END) AS overdue
FROM public.todos
WHERE user_id = 'YOUR-USER-ID-HERE'::UUID; -- 실제 사용자 ID로 변경!

-- 우선순위별 통계
SELECT 
  priority,
  COUNT(*) AS count,
  SUM(CASE WHEN completed THEN 1 ELSE 0 END) AS completed,
  SUM(CASE WHEN NOT completed THEN 1 ELSE 0 END) AS pending
FROM public.todos
WHERE user_id = 'YOUR-USER-ID-HERE'::UUID -- 실제 사용자 ID로 변경!
GROUP BY priority
ORDER BY 
  CASE priority
    WHEN 'high' THEN 1
    WHEN 'medium' THEN 2
    WHEN 'low' THEN 3
  END;

-- 카테고리별 통계
SELECT 
  UNNEST(category) AS category,
  COUNT(*) AS count
FROM public.todos
WHERE user_id = 'YOUR-USER-ID-HERE'::UUID -- 실제 사용자 ID로 변경!
GROUP BY category
ORDER BY count DESC;

-- =====================================================
-- 완료!
-- =====================================================

