import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { mockResponse } from '../lib/api'
import { mockCalendarNotes } from '../lib/mockData'
import type { CalendarNote } from '../types'

interface CalendarNoteRow {
  id: string
  date: string
  title: string
  content: string | null
  created_at: string
  updated_at: string
}

function mapNote(row: CalendarNoteRow): CalendarNote {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    content: row.content ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// mock 模式下的可变存储，支持增删改
let mockStore: CalendarNote[] | null = null
function getMockStore(): CalendarNote[] {
  if (!mockStore) mockStore = [...mockCalendarNotes()]
  return mockStore
}

/** 按月份（YYYY-MM）查询日历笔记 */
export async function listCalendarNotes(month: string): Promise<CalendarNote[]> {
  if (!isSupabaseConfigured || !supabase) {
    const notes = getMockStore()
      .filter((n) => n.date.startsWith(month))
      .sort((a, b) => a.date.localeCompare(b.date))
    return mockResponse(notes)
  }

  const { data, error } = await supabase
    .from('calendar_notes')
    .select('*')
    .like('date', `${month}-%`)
    .order('date', { ascending: true })
  if (error) throw error
  return ((data ?? []) as CalendarNoteRow[]).map(mapNote)
}

export interface NoteInput {
  id?: string
  date: string
  title: string
  content: string
}

/** 新建或更新某天的笔记 */
export async function upsertCalendarNote(input: NoteInput): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    const store = getMockStore()
    if (input.id) {
      const target = store.find((n) => n.id === input.id)
      if (target) {
        target.title = input.title
        target.content = input.content
        target.updatedAt = new Date().toISOString()
      }
    } else {
      store.push({
        id: `cn-${Date.now()}`,
        date: input.date,
        title: input.title,
        content: input.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
    await mockResponse(null, 200)
    return
  }

  if (input.id) {
    const { error } = await supabase
      .from('calendar_notes')
      .update({ title: input.title, content: input.content })
      .eq('id', input.id)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('calendar_notes')
      .insert({ date: input.date, title: input.title, content: input.content })
    if (error) throw error
  }
}

/** 删除某天的笔记 */
export async function deleteCalendarNote(id: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    mockStore = getMockStore().filter((n) => n.id !== id)
    await mockResponse(null, 200)
    return
  }

  const { error } = await supabase.from('calendar_notes').delete().eq('id', id)
  if (error) throw error
}
