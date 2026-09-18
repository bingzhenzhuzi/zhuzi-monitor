import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// ============================================================
// Supabase 客户端
// - 从环境变量读取 URL 与 anon key（绝不会出现 service_role key）
// - 若环境变量缺失，则 supabase 为 null，全站回退到 mock 数据，保证项目可运行
// ============================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** 是否已配置真实 Supabase（URL 与 anon key 均非空） */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null
