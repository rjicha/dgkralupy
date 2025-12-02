/**
 * Application-wide constants
 */

export const SITE_NAME = 'Gymnázium Kralupy nad Vltavou';
export const SITE_DESCRIPTION = 'Oficiální webové stránky Gymnázia Kralupy nad Vltavou';

// API endpoints
export const API_BASE_URL = import.meta.env.PUBLIC_API_URL || '';

// Navigation
export const MAIN_NAV_ITEMS = [
  { label: 'Domů', href: '/' },
  { label: 'O škole', href: '/o-skole' },
  { label: 'Studium', href: '/studium' },
  { label: 'Aktuality', href: '/aktuality' },
  { label: 'Kontakt', href: '/kontakt' },
] as const;
