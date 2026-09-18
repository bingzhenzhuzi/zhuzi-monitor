import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listCalendarNotes,
  upsertCalendarNote,
  deleteCalendarNote,
  type NoteInput,
} from '../services/calendarNotes'
import {
  listMemos,
  createMemo,
  updateMemo,
  deleteMemo,
  type MemoFilters,
  type MemoInput,
} from '../services/memos'

// ---------------- 日历笔记 ----------------

export function useCalendarNotes(month: string) {
  return useQuery({
    queryKey: ['calendar-notes', month],
    queryFn: () => listCalendarNotes(month),
  })
}

export function useSaveCalendarNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NoteInput) => upsertCalendarNote(input),
    onSuccess: (_data, variables) => {
      const month = variables.date.slice(0, 7)
      queryClient.invalidateQueries({ queryKey: ['calendar-notes', month] })
    },
  })
}

export function useDeleteCalendarNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCalendarNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-notes'] })
    },
  })
}

// ---------------- 记事本 ----------------

export function useMemos(filters: MemoFilters = {}) {
  return useQuery({
    queryKey: ['memos', filters],
    queryFn: () => listMemos(filters),
  })
}

export function useCreateMemo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: MemoInput) => createMemo(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['memos'] }),
  })
}

export function useUpdateMemo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: MemoInput) => updateMemo(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['memos'] }),
  })
}

export function useDeleteMemo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteMemo(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['memos'] }),
  })
}
