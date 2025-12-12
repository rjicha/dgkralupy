#!/usr/bin/env node

/**
 * Migration script to convert mockData.ts to Astro Content Collections
 *
 * This script:
 * 1. Creates article Markdown files from mockData articles
 * 2. Creates JSON settings files for navigation, contacts, and quick links
 * 3. Preserves all data structure and content
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import mock data
const mockDataPath = path.join(__dirname, '../src/data/mockData.ts');
let mockDataContent = fs.readFileSync(mockDataPath, 'utf-8');

// Parse the mock data (simplified parsing for this specific structure)
function parseArrayFromTS(content, varName) {
  const regex = new RegExp(`export const ${varName}[^=]*=\\s*\\[([\\s\\S]*?)\\];`, 'm');
  const match = content.match(regex);
  if (!match) return null;

  // Convert TS array to JSON-parseable format
  const arrayContent = match[1]
    .replace(/\/\/[^\n]*/g, '') // Remove comments
    .replace(/(\w+):/g, '"$1":') // Quote keys
    .replace(/'/g, '"') // Convert single quotes to double
    .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas

  try {
    return JSON.parse(`[${arrayContent}]`);
  } catch (e) {
    console.error(`Error parsing ${varName}:`, e.message);
    return null;
  }
}

function parseObjectFromTS(content, varName) {
  const regex = new RegExp(`export const ${varName}[^=]*=\\s*\\{([\\s\\S]*?)\\};`, 'm');
  const match = content.match(regex);
  if (!match) return null;

  const objectContent = match[1]
    .replace(/\/\/[^\n]*/g, '')
    .replace(/(\w+):/g, '"$1":')
    .replace(/'/g, '"')
    .replace(/,(\s*})/g, '$1');

  try {
    return JSON.parse(`{${objectContent}}`);
  } catch (e) {
    console.error(`Error parsing ${varName}:`, e.message);
    return null;
  }
}

// Create directories
const contentDir = path.join(__dirname, '../src/content');
const articlesDir = path.join(contentDir, 'articles');
const pagesDir = path.join(contentDir, 'pages');
const settingsDir = path.join(contentDir, 'settings');

[articlesDir, pagesDir, settingsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Created directory: ${path.relative(process.cwd(), dir)}`);
  }
});

// Migrate articles
console.log('\n📝 Migrating articles...');
const articles = parseArrayFromTS(mockDataContent, 'articles');

if (articles && articles.length > 0) {
  articles.forEach((article) => {
    const frontmatter = `---
title: "${article.title.replace(/"/g, '\\"')}"
slug: "${article.slug}"
excerpt: "${article.excerpt.replace(/"/g, '\\"')}"
publishedAt: "${article.publishedAt}"
author: "${article.author}"
tags: ${JSON.stringify(article.tags)}
image: "${article.image}"
featured: ${article.featured}
important: ${article.important}
draft: false
---

${article.content}
`;

    const filename = path.join(articlesDir, `${article.slug}.md`);
    fs.writeFileSync(filename, frontmatter, 'utf-8');
    console.log(`  ✓ Created: ${article.slug}.md`);
  });
  console.log(`\n✅ Migrated ${articles.length} articles`);
} else {
  console.log('  ⚠ No articles found to migrate');
}

// Migrate navigation
console.log('\n🧭 Migrating navigation...');
const navigationSections = parseArrayFromTS(mockDataContent, 'navigationSections');

if (navigationSections) {
  const navigationData = {
    sections: navigationSections
  };

  const navFile = path.join(settingsDir, 'navigation.json');
  fs.writeFileSync(navFile, JSON.stringify(navigationData, null, 2), 'utf-8');
  console.log(`  ✓ Created: navigation.json`);
  console.log(`\n✅ Migrated navigation (${navigationSections.length} sections)`);
} else {
  console.log('  ⚠ No navigation data found');
}

// Migrate quick links
console.log('\n🔗 Migrating quick links...');
const quickLinks = parseArrayFromTS(mockDataContent, 'quickLinks');

if (quickLinks) {
  const quickLinksData = {
    links: quickLinks
  };

  const quickLinksFile = path.join(settingsDir, 'quick-links.json');
  fs.writeFileSync(quickLinksFile, JSON.stringify(quickLinksData, null, 2), 'utf-8');
  console.log(`  ✓ Created: quick-links.json`);
  console.log(`\n✅ Migrated quick links (${quickLinks.length} links)`);
} else {
  console.log('  ⚠ No quick links found');
}

// Migrate contacts
console.log('\n📞 Migrating contacts...');
const schoolContact = parseObjectFromTS(mockDataContent, 'schoolContact');
const cafeteriaContact = parseObjectFromTS(mockDataContent, 'cafeteriaContact');
const socialMedia = parseObjectFromTS(mockDataContent, 'socialMedia');

if (schoolContact && cafeteriaContact && socialMedia) {
  const contactsData = {
    school: schoolContact,
    cafeteria: cafeteriaContact,
    socialMedia: socialMedia
  };

  const contactsFile = path.join(settingsDir, 'contacts.json');
  fs.writeFileSync(contactsFile, JSON.stringify(contactsData, null, 2), 'utf-8');
  console.log(`  ✓ Created: contacts.json`);
  console.log(`\n✅ Migrated contacts`);
} else {
  console.log('  ⚠ Some contact data missing');
}

console.log('\n🎉 Migration complete!\n');
console.log('Next steps:');
console.log('  1. Review the generated files in src/content/');
console.log('  2. Update pages and components to use Content Collections API');
console.log('  3. Run npm run build to verify everything works\n');
