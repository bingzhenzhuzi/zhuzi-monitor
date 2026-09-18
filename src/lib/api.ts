// ============================================================
// 数据访问公共助手
// 页面组件一律通过 src/services/ 中的函数访问数据，不直接写 Supabase 查询。
// 本文件只提供 mock 模式下的延迟模拟与公共类型。
// ============================================================

export { isSupabaseConfigured } from './supabaseClient'

/** 模拟网络延迟，让 mock 数据同样具备加载态 */
export function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** mock 模式：延迟后返回数据 */
export async function mockResponse<T>(data: T, ms = 300): Promise<T> {
  await delay(ms)
  return data
}
