import { createPortalSupabaseClient, fetchUserFeatureFlags } from '@stonecode/portal-sdk'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const STONECODE_URL = (import.meta.env.VITE_STONECODE_URL as string | undefined) ?? 'https://stonecode.ai'

export const supabase = createPortalSupabaseClient({
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  storageKey: 'mb-auth',
})

export async function hasMbDashboardAccess(userId: string): Promise<boolean> {
  const flags = await fetchUserFeatureFlags(supabase, userId)
  return flags.mb_dashboard === true
}
