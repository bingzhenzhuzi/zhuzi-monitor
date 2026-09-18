import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

export interface AuthUser {
  id: string
  email: string
}

interface AuthResult {
  error?: string
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  /** 是否处于演示模式（未配置 Supabase，使用本地 mock 登录） */
  demoMode: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}

const MOCK_KEY = 'zhuzi_mock_user'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function mapSession(session: Session | null): AuthUser | null {
  if (!session?.user) return null
  return { id: session.user.id, email: session.user.email ?? '' }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const demoMode = !isSupabaseConfigured

  useEffect(() => {
    // 演示模式：从 localStorage 恢复 mock 用户
    if (demoMode) {
      const raw = localStorage.getItem(MOCK_KEY)
      if (raw) {
        try {
          setUser(JSON.parse(raw) as AuthUser)
        } catch {
          /* 忽略损坏的缓存 */
        }
      }
      setLoading(false)
      return
    }

    // 真实模式：订阅 Supabase Auth 状态
    supabase!.auth
      .getSession()
      .then(({ data }) => {
        setUser(mapSession(data.session))
        setLoading(false)
      })
      .catch(() => setLoading(false))

    const { data: sub } = supabase!.auth.onAuthStateChange((_event, session) => {
      setUser(mapSession(session))
      setLoading(false)
    })

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [demoMode])

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (demoMode) {
        const u: AuthUser = { id: 'mock-user', email }
        localStorage.setItem(MOCK_KEY, JSON.stringify(u))
        setUser(u)
        return {}
      }
      const { error } = await supabase!.auth.signInWithPassword({ email, password })
      return error ? { error: error.message } : {}
    },
    [demoMode],
  )

  const signUp = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (demoMode) {
        const u: AuthUser = { id: 'mock-user', email }
        localStorage.setItem(MOCK_KEY, JSON.stringify(u))
        setUser(u)
        return {}
      }
      const { error } = await supabase!.auth.signUp({ email, password })
      return error ? { error: error.message } : {}
    },
    [demoMode],
  )

  const signOut = useCallback(async () => {
    if (demoMode) {
      localStorage.removeItem(MOCK_KEY)
      setUser(null)
      return
    }
    await supabase!.auth.signOut()
    setUser(null)
  }, [demoMode])

  const value = useMemo(
    () => ({ user, loading, demoMode, signIn, signUp, signOut }),
    [user, loading, demoMode, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用')
  return ctx
}
