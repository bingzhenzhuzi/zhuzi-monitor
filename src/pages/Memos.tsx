import { useState } from 'react'
import { useMemos, useCreateMemo, useUpdateMemo, useDeleteMemo } from '../hooks/useNotes'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Loading, ErrorState, EmptyState } from '../components/ui/feedback'
import { MEMO_CATEGORIES } from '../lib/constants'
import { fmtDateTime, cx } from '../lib/utils'
import type { Memo } from '../types'

const CATEGORY_TONE: Record<string, 'accent' | 'green' | 'amber' | 'violet'> = {
  设备维护: 'accent',
  巡检记录: 'green',
  待办事项: 'amber',
  其他: 'violet',
}

export function Memos() {
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('all')
  const [editing, setEditing] = useState<Memo | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [cat, setCat] = useState<string>(MEMO_CATEGORIES[0])

  const memos = useMemos({ keyword, category })
  const createMutation = useCreateMemo()
  const updateMutation = useUpdateMemo()
  const deleteMutation = useDeleteMemo()

  function startNew() {
    setEditing(null)
    setTitle('')
    setContent('')
    setCat(MEMO_CATEGORIES[0])
  }

  function startEdit(m: Memo) {
    setEditing(m)
    setTitle(m.title)
    setContent(m.content)
    setCat(m.category)
  }

  function handleSave() {
    if (!title.trim()) return
    if (editing) {
      updateMutation.mutate({ id: editing.id, title: title.trim(), content, category: cat })
      setEditing(null)
    } else {
      createMutation.mutate({ title: title.trim(), content, category: cat })
    }
    startNew()
  }

  function handleDelete(id: string) {
    if (!window.confirm('确定删除这条记事吗？')) return
    deleteMutation.mutate(id)
  }

  const saving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
      {/* 列表 */}
      <Card
        title="记事列表"
        extra={<button className="btn-primary !px-3 !py-1.5 text-xs" onClick={startNew}>新建记事</button>}
      >
        <div className="mb-3 flex flex-wrap gap-3">
          <input className="input max-w-xs" placeholder="搜索标题或正文" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">全部分类</option>
            {MEMO_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {memos.isLoading ? (
          <Loading label="加载记事…" />
        ) : memos.isError ? (
          <ErrorState message="记事加载失败" onRetry={() => memos.refetch()} />
        ) : (memos.data?.length ?? 0) === 0 ? (
          <EmptyState title="暂无记事" description="点击「新建记事」开始记录" />
        ) : (
          <ul className="divide-y divide-white/5">
            {memos.data!.map((m: Memo) => (
              <li
                key={m.id}
                className={cx(
                  'cursor-pointer rounded-lg px-3 py-3 transition hover:bg-white/5',
                  editing?.id === m.id && 'bg-accent/5 ring-1 ring-accent/20',
                )}
                onClick={() => startEdit(m)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium text-slate-200">{m.title}</span>
                  <Badge tone={CATEGORY_TONE[m.category] ?? 'gray'}>{m.category}</Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{m.content}</p>
                <div className="mt-1.5 text-xs text-slate-600">{fmtDateTime(m.createdAt)}</div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* 编辑区 */}
      <Card title={editing ? '编辑记事' : '新建记事'} bodyClassName="space-y-3">
        <div>
          <label className="label">标题</label>
          <input className="input" placeholder="记事标题" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="label">分类标签</label>
          <select className="select w-full" value={cat} onChange={(e) => setCat(e.target.value)}>
            {MEMO_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">正文</label>
          <textarea className="input min-h-[200px]" placeholder="记录设备维护备忘、巡检记录、待办事项…" value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-primary flex-1" disabled={saving || !title.trim()} onClick={handleSave}>
            {saving ? '保存中…' : editing ? '保存修改' : '保存'}
          </button>
          {editing && (
            <>
              <button className="btn-ghost" onClick={startNew}>取消</button>
              <button className="btn-danger" disabled={deleteMutation.isPending} onClick={() => handleDelete(editing.id)}>
                删除
              </button>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
