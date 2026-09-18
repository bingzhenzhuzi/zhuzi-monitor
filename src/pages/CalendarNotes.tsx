import { useEffect, useMemo, useState } from 'react'
import { useCalendarNotes, useSaveCalendarNote, useDeleteCalendarNote } from '../hooks/useNotes'
import { Card } from '../components/ui/Card'
import { Loading, ErrorState, EmptyState } from '../components/ui/feedback'
import { todayBeijingKey, cx, fmtDateTime } from '../lib/utils'
import type { CalendarNote } from '../types'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function CalendarNotes() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-11
  const [selectedDate, setSelectedDate] = useState<string>(todayBeijingKey())
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)

  const monthKey = `${year}-${pad(month + 1)}`
  const notesQuery = useCalendarNotes(monthKey)
  const saveMutation = useSaveCalendarNote()
  const deleteMutation = useDeleteCalendarNote()

  const notesByDate = useMemo(() => {
    const map = new Map<string, CalendarNote>()
    for (const n of notesQuery.data ?? []) map.set(n.date, n)
    return map
  }, [notesQuery.data])

  // 选中日期变化时同步编辑区
  useEffect(() => {
    const note = notesByDate.get(selectedDate)
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setEditingId(note.id)
    } else {
      setTitle('')
      setContent('')
      setEditingId(null)
    }
    setDirty(false)
  }, [selectedDate, notesByDate])

  const today = todayBeijingKey()

  const cells = useMemo(() => {
    const first = new Date(year, month, 1).getDay()
    const days = new Date(year, month + 1, 0).getDate()
    const list: Array<{ key: string; day: number } | null> = []
    for (let i = 0; i < first; i++) list.push(null)
    for (let d = 1; d <= days; d++) list.push({ key: `${year}-${pad(month + 1)}-${pad(d)}`, day: d })
    return list
  }, [year, month])

  function changeMonth(delta: number) {
    const d = new Date(year, month + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
  }

  function goToday() {
    const t = new Date()
    setYear(t.getFullYear())
    setMonth(t.getMonth())
    setSelectedDate(todayBeijingKey())
  }

  function handleSave() {
    if (!title.trim()) return
    saveMutation.mutate({ id: editingId ?? undefined, date: selectedDate, title: title.trim(), content })
    setDirty(false)
  }

  function handleDelete() {
    if (!editingId) return
    if (!window.confirm('确定删除当天的笔记吗？')) return
    deleteMutation.mutate(editingId)
    setEditingId(null)
    setTitle('')
    setContent('')
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      {/* 月历 */}
      <Card
        title={
          <div className="flex items-center gap-3">
            <button className="btn-ghost !px-2 !py-1" onClick={() => changeMonth(-1)}>‹</button>
            <span className="font-mono">{year} 年 {month + 1} 月</span>
            <button className="btn-ghost !px-2 !py-1" onClick={() => changeMonth(1)}>›</button>
            <button className="btn-ghost !px-2 !py-1 text-xs" onClick={goToday}>今天</button>
          </div>
        }
      >
        {notesQuery.isLoading ? (
          <Loading label="加载笔记…" />
        ) : notesQuery.isError ? (
          <ErrorState message="笔记加载失败" onRetry={() => notesQuery.refetch()} />
        ) : (
          <div>
            <div className="grid grid-cols-7 gap-1 border-b border-white/5 pb-2 text-center text-xs text-slate-500">
              {WEEKDAYS.map((w) => (
                <div key={w}>{w}</div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {cells.map((c, i) =>
                c ? (
                  <button
                    key={c.key}
                    onClick={() => setSelectedDate(c.key)}
                    className={cx(
                      'relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition',
                      c.key === selectedDate
                        ? 'bg-accent/20 text-cyan-300 ring-1 ring-accent/40'
                        : c.key === today
                          ? 'bg-white/5 text-slate-200 hover:bg-white/10'
                          : 'text-slate-300 hover:bg-white/5',
                    )}
                  >
                    {c.day}
                    {notesByDate.has(c.key) && (
                      <span className="absolute bottom-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
                    )}
                  </button>
                ) : (
                  <div key={`empty-${i}`} />
                ),
              )}
            </div>
          </div>
        )}
      </Card>

      {/* 编辑区 */}
      <Card title="笔记编辑" bodyClassName="space-y-3">
        <div className="text-xs text-slate-500">
          日期：<span className="font-mono text-slate-300">{selectedDate}</span>
        </div>
        <input
          className="input"
          placeholder="笔记标题"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            setDirty(true)
          }}
        />
        <textarea
          className="input min-h-[180px]"
          placeholder="记录当天的工作内容、巡检情况、待办安排…"
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            setDirty(true)
          }}
        />
        {editingId && (
          <div className="text-[11px] text-slate-500">上次更新：{fmtDateTime(notesByDate.get(selectedDate)?.updatedAt)}</div>
        )}
        <div className="flex items-center gap-2">
          <button className="btn-primary flex-1" disabled={saveMutation.isPending || !title.trim()} onClick={handleSave}>
            {saveMutation.isPending ? '保存中…' : '保存笔记'}
          </button>
          {editingId && (
            <button className="btn-danger" disabled={deleteMutation.isPending} onClick={handleDelete}>
              删除
            </button>
          )}
        </div>
        {dirty && <p className="text-xs text-amber-300">有未保存的修改</p>}
        {!editingId && !dirty && <EmptyState title="当天暂无笔记" description="填写标题与内容后保存" />}
      </Card>
    </div>
  )
}
