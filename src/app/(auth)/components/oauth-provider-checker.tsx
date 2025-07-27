'use server'

import { env } from '@/lib/env'
import { isProd } from '@/lib/environment'

export async function getOAuthProviderStatus() {
  const googleAvailable = !!(
    env.GOOGLE_CLIENT_ID &&
    env.GOOGLE_CLIENT_SECRET &&
    env.GOOGLE_CLIENT_ID !== 'placeholder' &&
    env.GOOGLE_CLIENT_SECRET !== 'placeholder'
  )

  return { googleAvailable, isProduction: isProd }
}