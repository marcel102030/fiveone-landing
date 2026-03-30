import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import { clearCurrentUser, setCurrentUser } from '../utils/user'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuthState {
  session:  Session | null
  user:     User | null
  loading:  boolean
}

interface AuthContextValue extends AuthState {
  signIn:  (email: string, password: string, remember?: boolean) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  /** E-mail do usuário autenticado (atalho conveniente). */
  email:   string | null
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user:    null,
    loading: true,
  })

  // Carrega sessão existente e assina mudanças
  useEffect(() => {
    let mounted = true

    // Sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setState({ session, user: session?.user ?? null, loading: false })
    })

    // Listener de mudanças (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setState({ session, user: session?.user ?? null, loading: false })
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // ── signIn ─────────────────────────────────────────────────────────────────

  const signIn = useCallback(
    async (email: string, password: string, remember = false) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error) {
        // Mantém compatibilidade com código legado que lê localStorage
        setCurrentUser(email, remember)
      }
      return { error: error as Error | null }
    },
    [],
  )

  // ── signOut ────────────────────────────────────────────────────────────────

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    clearCurrentUser()
  }, [])

  const value: AuthContextValue = {
    ...state,
    email:   state.user?.email ?? null,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}

/** Retorna true enquanto a sessão ainda está sendo carregada. */
export function useAuthLoading(): boolean {
  return useAuth().loading
}

/** Retorna o e-mail do usuário autenticado, ou null. */
export function useAuthEmail(): string | null {
  return useAuth().email
}
