/** Cliente Supabase falso, só para testes: registra chamadas e devolve respostas configuradas. */
import type { SupabaseClient } from '@supabase/supabase-js'

export interface FakeOptions {
  rpc?: Record<string, (args: Record<string, unknown>) => { data?: unknown; error?: { message: string } | null }>
  tables?: Record<string, unknown[]>
  login?: { email: string; password: string }
}

export function makeFakeRemote(opts: FakeOptions = {}) {
  const calls: { kind: string; name: string; args?: unknown }[] = []
  let session: { user: { id: string } } | null = null
  const listeners = new Set<(e: string, s: unknown) => void>()

  const query = (table: string) => {
    const result = { data: opts.tables?.[table] ?? [], error: null }
    const chain: Record<string, unknown> = {}
    for (const m of ['select', 'gte', 'lt', 'order', 'limit', 'not', 'eq']) chain[m] = () => chain
    chain.then = (res: (v: unknown) => unknown) => Promise.resolve(result).then(res)
    chain.update = (values: unknown) => {
      calls.push({ kind: 'update', name: table, args: values })
      const c: Record<string, unknown> = {}
      c.eq = (col: string, val: unknown) => {
        calls.push({ kind: 'update-eq', name: table, args: { [col]: val } })
        return Promise.resolve({ data: null, error: null })
      }
      return c
    }
    return chain
  }

  const client = {
    rpc: async (name: string, args: Record<string, unknown> = {}) => {
      calls.push({ kind: 'rpc', name, args })
      const h = opts.rpc?.[name]
      const r = h ? h(args) : { data: 'ok', error: null }
      return { data: r.data ?? null, error: r.error ?? null }
    },
    from: (table: string) => query(table),
    auth: {
      getSession: async () => ({ data: { session } }),
      onAuthStateChange: (fn: (e: string, s: unknown) => void) => {
        listeners.add(fn)
        return { data: { subscription: { unsubscribe: () => listeners.delete(fn) } } }
      },
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        calls.push({ kind: 'login', name: email })
        if (opts.login && email === opts.login.email && password === opts.login.password) {
          session = { user: { id: 'admin' } }
          listeners.forEach((l) => l('SIGNED_IN', session))
          return { data: { session }, error: null }
        }
        return { data: { session: null }, error: { message: 'Invalid login credentials' } }
      },
      signOut: async () => {
        session = null
        listeners.forEach((l) => l('SIGNED_OUT', null))
        return { error: null }
      },
    },
  }
  return { client: client as unknown as SupabaseClient, calls }
}
