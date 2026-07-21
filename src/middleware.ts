import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Next.js 16 Proxy always uses the Node.js runtime, which the current
// @opennextjs/cloudflare adapter does not support for middleware yet.
// Keep the legacy Edge Middleware convention until adapter support lands.
export default createMiddleware(routing)

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}
