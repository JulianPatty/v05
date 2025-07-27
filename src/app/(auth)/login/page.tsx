import { getOAuthProviderStatus } from '../components/oauth-provider-checker'
import LoginForm from './login-form'

// Force dynamic rendering to avoid prerender errors with search params
export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const { googleAvailable, isProduction } = await getOAuthProviderStatus()

  return (
    <LoginForm
      googleAvailable={googleAvailable}
      isProduction={isProduction}
    />
  )
}
