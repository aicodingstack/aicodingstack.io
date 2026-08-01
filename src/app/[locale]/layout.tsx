import { GoogleAnalytics } from '@next/third-parties/google'
import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import './globals.css'
import ClientLayout from '@/components/ClientLayout'
import { JsonLd } from '@/components/JsonLd'
import { defaultLocale, type Locale, locales } from '@/i18n/config'
import { createRootLayoutMetadata, SITE_CONFIG } from '@/lib/metadata'
import { buildLanguageAlternates, mapLocaleToOG } from '@/lib/metadata/helpers'
import { generateRootOrganizationSchema, generateWebSiteSchema } from '@/lib/metadata/schemas'
import type { LocalePageProps } from '@/types/locale'
import { WebVitals } from './web-vitals'

// Reduced font weights from 4 to 2 for better performance
const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '600'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
  preload: true,
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

export async function generateMetadata({
  params,
}: LocalePageProps & { children: React.ReactNode }): Promise<Metadata> {
  const { locale } = await params

  // Load translations for metadata
  const messages = await getMessages({ locale })
  const siteMessages = messages.site as Record<string, string> | undefined

  const title = siteMessages?.title || 'AI Coding Stack - Your AI Coding Ecosystem Hub'
  const description =
    siteMessages?.description ||
    'Comprehensive directory for AI coding tools. Discover, compare and explore IDEs, CLIs, MCP servers, models and providers.'

  // Get canonical path based on locale
  const canonicalPath = locale === defaultLocale ? '/' : `/${locale}`
  const baseUrl = SITE_CONFIG.url

  // Build OpenGraph with proper locale handling
  const ogLocale = mapLocaleToOG(locale)
  const alternateLocales = locales.filter(l => l !== locale).map(l => mapLocaleToOG(l))

  // Use the new template system
  return createRootLayoutMetadata({
    locale: locale as Locale,
    title,
    description,
    canonical: canonicalPath,
    languageAlternates: buildLanguageAlternates(''),
    openGraph: {
      type: 'website',
      locale: ogLocale,
      alternateLocale: alternateLocales,
      url: `${baseUrl}${canonicalPath}`,
      siteName: SITE_CONFIG.name,
      title,
      description,
      // Images are auto-detected from opengraph-image.tsx files
    },
    twitter: {
      card: 'summary_large_image',
      site: SITE_CONFIG.twitter.site,
      creator: SITE_CONFIG.twitter.creator,
      title,
      description,
      // Images are auto-detected from opengraph-image.tsx files
    },
  })
}

export default async function RootLayout({
  children,
  params,
}: LocalePageProps & { children: React.ReactNode }) {
  const { locale } = await params

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  const messages = await getMessages()

  // Generate JSON-LD schemas using new generators
  const organizationSchema = await generateRootOrganizationSchema()
  const websiteSchema = await generateWebSiteSchema()

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* Theme initialization script (inline for performance) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('aicodingstack-theme') || 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />

        {/* Structured Data - Generated using unified schema system */}
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
      </head>
      <body
        className={`${ibmPlexMono.variable} font-mono bg-[var(--color-bg)] text-[var(--color-text)]`}
      >
        <NextIntlClientProvider messages={messages}>
          <ClientLayout>{children}</ClientLayout>
          <WebVitals />
        </NextIntlClientProvider>
      </body>
      {/* Load GA after page interactive for better performance */}
      {process.env.NODE_ENV === 'production' && <GoogleAnalytics gaId="G-P6Y3S6L23P" />}
    </html>
  )
}
