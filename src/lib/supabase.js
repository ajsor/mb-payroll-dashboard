import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const STONECODE_URL = import.meta.env.VITE_STONECODE_URL || 'https://stonecode.ai'

/**
 * Check if the authenticated user has the 'mb_dashboard' feature flag enabled.
 * Mirrors the logic in stonecode.ai's getUserFeatureFlags helper.
 */
export async function hasMbDashboardAccess(userId) {
  const [{ data: defaultFlags }, { data: userFlags }] = await Promise.all([
    supabase.from('feature_flags').select('name, enabled_default').eq('name', 'mb_dashboard').single(),
    supabase.from('user_feature_flags').select('enabled, feature_flags(name)').eq('user_id', userId),
  ])

  // Check for user-level override first
  const override = userFlags?.find((uf) => uf.feature_flags?.name === 'mb_dashboard')
  if (override !== undefined) {
    return override.enabled
  }

  // Fall back to feature default
  return defaultFlags?.enabled_default ?? false
}
