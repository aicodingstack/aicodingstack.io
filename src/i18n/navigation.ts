import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';
import { locales, defaultLocale } from './config';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

// Create localized versions of Link, redirect, usePathname, useRouter, getPathname
// These will automatically handle locale prefixes based on the current locale
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
