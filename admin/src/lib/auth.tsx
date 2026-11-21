import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, post, setUnauthorizedHandler, token } from './api'

export type Level = 'view' | 'edit'
/** role = a role key (owner, editor, sales or one built in Users & roles). permissions = module id → level. */
export type User = { id: number; name: string; email: string; role: string; role_name?: { bn: string; en: string }; permissions: Record<string, Level> }
type Auth = { user: User | null; ready: boolean; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void>; can: (module: string, level?: Level) => boolean }
const Ctx = createContext<Auth>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null))
    if (!token.get()) { setReady(true); return }
    api<{ user: User }>('/auth/me').then((r) => setUser(r.user)).catch(() => token.set(null)).finally(() => setReady(true))
  }, [])
  const login = useCallback(async (email: string, password: string) => {
    const r = await post<{ token: string; user: User }>('/auth/login', { email, password })
    token.set(r.token)
    setUser(r.user)
  }, [])
  const logout = useCallback(async () => {
    try { await post('/auth/logout') } catch { /* token may be gone already */ }
    token.set(null)
    setUser(null)
  }, [])
  const can = useCallback((module: string, level: Level = 'view') => {
    const have = user?.permissions?.[module]
    return level === 'view' ? have === 'view' || have === 'edit' : have === 'edit'
  }, [user])
  return <Ctx.Provider value={{ user, ready, login, logout, can }}>{children}</Ctx.Provider>
}
export const useAuth = () => useContext(Ctx)
