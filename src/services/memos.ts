import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { mockResponse } from '../lib/api'
import { mockMemos } from '../lib/mockData'
import type { Memo } from '../types'

interface MemoRow {
  id: string
  title: string
  content: string | null
  category: string
  created_at: string
  updated_at: string
}

function mapMemo(row: MemoRow): Memo {
  return {
    id: row.id,
    title: row.title,
    content: row.content ?? '',
    category: row.category,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

let mockStore: Memo[] | null = null
function getMockStore(): Memo[] {
  if (!mockStore) mockStore = [...mockMemos()]
  return mockStore
}

export interface MemoFilters {
  keyword?: string
  category?: string
}

/** 记事列表（按创建时间倒序） */
export async function listMemos(filters: MemoFilters = {}): Promise<Memo[]> {
  const { keyword = '', category = 'all' } = filters

  if (!isSupabaseConfigured || !supabase) {
    let memos = [...getMockStore()]
    if (category !== 'all') memos = memos.filter((m) => m.category === category)
    if (keyword) {
      const k = keyword.toLowerCase()
      memos = memos.filter(
        (m) => m.title.toLowerCase().includes(k) || m.content.toLowerCase().includes(k),
      )
    }
    memos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return mockResponse(memos)
  }

  let query = supabase.from('memos').select('*').order('created_at', { ascending: false })
  if (category !== 'all') query = query.eq('category', category)
  if (keyword) {
    query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return ((data ?? []) as MemoRow[]).map(mapMemo)
}

export interface MemoInput {
  id?: string
  title: string
  content: string
  category: string
}

/** 新建记事 */
export async function createMemo(input: MemoInput): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    getMockStore().push({
      id: `memo-${Date.now()}`,
      title: input.title,
      content: input.content,
      category: input.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    await mockResponse(null, 200)
    return
  }

  const { error } = await supabase
    .from('memos')
    .insert({ title: input.title, content: input.content, category: input.category })
  if (error) throw error
}

/** 更新记事 */
export async function updateMemo(input: MemoInput): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    const target = getMockStore().find((m) => m.id === input.id)
    if (target) {
      target.title = input.title
      target.content = input.content
      target.category = input.category
      target.updatedAt = new Date().toISOString()
    }
    await mockResponse(null, 200)
    return
  }

  const { error } = await supabase
    .from('memos')
    .update({ title: input.title, content: input.content, category: input.category })
    .eq('id', input.id)
  if (error) throw error
}

/** 删除记事 */
export async function deleteMemo(id: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    mockStore = getMockStore().filter((m) => m.id !== id)
    await mockResponse(null, 200)
    return
  }

  const { error } = await supabase.from('memos').delete().eq('id', id)
  if (error) throw error
}
