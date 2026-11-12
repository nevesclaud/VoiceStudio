/**
 * Conexão com o Supabase (opcional). Sem VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY,
 * o app continua 100% local e as áreas remotas mostram que a integração está pendente.
 *
 * A chave usada aqui é a pública (anon/publishable). A segurança vem das regras do banco (RLS),
 * nunca de esconder a chave. A chave service_role NUNCA vai para o app.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

function validUrl(u: string): boolean {
  try {
    return new URL(u).protocol === 'https:'
  } catch {
    return false
  }
}

export const remoteConfigured = validUrl(url) && key.length > 20

let client: SupabaseClient | null = null
let override: SupabaseClient | null = null

export function getRemote(): SupabaseClient | null {
  if (override) return override
  if (!remoteConfigured) return null
  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'integra-painel-auth' },
    })
  }
  return client
}

export function isRemoteAvailable(): boolean {
  return Boolean(override) || remoteConfigured
}

/** Usado apenas nos testes. */
export function __setRemoteForTests(c: SupabaseClient | null): void {
  override = c
}

export type RemoteErrorCode = 'rate_limited' | 'invalid' | 'offline' | 'forbidden' | 'unknown'

export function remoteErrorCode(err: unknown): RemoteErrorCode {
  const msg = typeof err === 'object' && err && 'message' in err ? String((err as { message: unknown }).message) : String(err)
  if (/rate_limited/.test(msg)) return 'rate_limited'
  if (/invalid_/.test(msg)) return 'invalid'
  if (/forbidden|42501|permission/.test(msg)) return 'forbidden'
  if (/Failed to fetch|NetworkError|network|Load failed/i.test(msg)) return 'offline'
  return 'unknown'
}
