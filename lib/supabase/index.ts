/**
 * Supabase 클라이언트 모듈 내보내기
 */

export { createClient as createBrowserClient } from './client';
export { createClient as createServerClient } from './server';
export { updateSession } from './middleware';
export type { Database } from './types';

