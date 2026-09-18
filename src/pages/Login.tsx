import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/ui/feedback'

export function Login() {
  const { user, signIn, signUp, demoMode } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')
    if (!email || !password) {
      setError('请输入邮箱和密码')
      return
    }
    setLoading(true)
    const res = mode === 'signin' ? await signIn(email, password) : await signUp(email, password)
    setLoading(false)
    if (res.error) {
      setError(res.error)
      return
    }
    if (mode === 'signup' && !demoMode) {
      setInfo('注册成功，若开启了邮箱确认，请前往邮箱验证后再登录')
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-3xl">
            🎋
          </div>
          <h1 className="text-xl font-semibold text-slate-100">竹子嵌入式设备监控平台</h1>
          <p className="text-sm text-slate-500">多协议统一接入 · 一屏掌控全局</p>
        </div>

        <div className="card card-pad">
          <div className="mb-4 flex rounded-lg bg-white/5 p-1">
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m)
                  setError('')
                  setInfo('')
                }}
                className={`flex-1 rounded-md py-1.5 text-sm transition ${
                  mode === m ? 'bg-accent/15 font-medium text-cyan-300' : 'text-slate-400'
                }`}
              >
                {m === 'signin' ? '登录' : '注册'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">
                邮箱
              </label>
              <input
                id="email"
                className="input"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="password">
                密码
              </label>
              <input
                id="password"
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-300">{error}</p>}
            {info && <p className="text-sm text-cyan-300">{info}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading && <Spinner />}
              {mode === 'signin' ? '登录' : '注册'}
            </button>
          </form>
        </div>

        {demoMode && (
          <p className="mt-4 text-center text-xs text-slate-500">
            未配置 Supabase 环境变量，当前为<b className="text-amber-300">演示模式</b>，任意邮箱密码即可登录。
            <br />
            配置 <code className="font-mono text-cyan-400">.env.local</code> 后自动切换为 Supabase Auth。
          </p>
        )}
      </div>
    </div>
  )
}
