/**
 * Shared TypeScript types and interfaces
 */

export interface NavItem {
  label: string;
  href: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: Date;
  updatedAt?: Date;
  author?: string;
  tags?: string[];
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  updatedAt?: Date;
}
