/**
 * Convert Cloudinary full URLs to public_ids in content files
 * This ensures consistent storage format (public_id only, not full URLs)
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Extract public_id from Cloudinary URL
 */
function extractPublicId(url: string): string {
  // If it's already a public_id (no https://), return as-is
  if (!url.startsWith('http')) {
    return url;
  }

  // Extract public_id from Cloudinary URL, handling:
  // - Basic: https://res.cloudinary.com/zzbazza/image/upload/dgkralupy/image.jpg
  // - With version: https://res.cloudinary.com/zzbazza/image/upload/v1234567890/dgkralupy/image.jpg
  // - With transformations: https://res.cloudinary.com/zzbazza/image/upload/w_800,h_600/v1234567890/dgkralupy/image.jpg
  // Result: dgkralupy/image.jpg

  const match = url.match(/\/upload\/(?:[^/]+\/)*?(v\d+\/)?(.+)$/);
  return match ? match[2] : url;
}

/**
 * Convert full Cloudinary URLs to public_ids in markdown content
 */
function convertUrlsInContent(content: string): { content: string; count: number } {
  let count = 0;

  // Match pattern: "  src: https://res.cloudinary.com/..."
  const updatedContent = content.replace(
    /^(\s+src:\s+)(https:\/\/res\.cloudinary\.com\/.+)$/gm,
    (match, prefix, url) => {
      const publicId = extractPublicId(url);
      if (publicId !== url) {
        count++;
        console.log(`  Converting: ${url}`);
        console.log(`  To:         ${publicId}`);
        return `${prefix}${publicId}`;
      }
      return match;
    }
  );

  return { content: updatedContent, count };
}

/**
 * Recursively find all .md files in a directory
 */
function findMarkdownFiles(dir: string): string[] {
  const files: string[] = [];

  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...findMarkdownFiles(fullPath));
      } else if (entry.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }

  return files;
}

function main() {
  console.log('🔄 Converting Cloudinary URLs to public_ids...\n');

  // Find all markdown files in content directory
  const files = findMarkdownFiles('src/content');

  let totalConverted = 0;
  let filesModified = 0;

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const { content: updatedContent, count } = convertUrlsInContent(content);

    if (count > 0) {
      writeFileSync(file, updatedContent, 'utf-8');
      console.log(`✅ ${file}: ${count} URL(s) converted\n`);
      filesModified++;
      totalConverted += count;
    }
  }

  console.log('='.repeat(60));
  console.log(`✅ Conversion complete!`);
  console.log(`   Files modified: ${filesModified}`);
  console.log(`   URLs converted: ${totalConverted}`);
  console.log('='.repeat(60));
}

main();
