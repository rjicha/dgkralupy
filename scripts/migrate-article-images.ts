import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

interface MigrationOptions {
  dryRun?: boolean;
  verbose?: boolean;
}

interface MigrationResult {
  total: number;
  migrated: number;
  skipped: number;
  errors: string[];
}

/**
 * Migrate article images from string format to object format
 */
export function migrateArticleImages(options: MigrationOptions = {}): MigrationResult {
  const { dryRun = false, verbose = false } = options;
  const articlesDir = './src/content/articles';

  const result: MigrationResult = {
    total: 0,
    migrated: 0,
    skipped: 0,
    errors: [],
  };

  if (!fs.existsSync(articlesDir)) {
    result.errors.push(`Articles directory not found: ${articlesDir}`);
    return result;
  }

  const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith('.md'));
  result.total = files.length;

  console.log(`\n📦 Migrating ${files.length} articles...`);
  if (dryRun) {
    console.log('🏃 DRY RUN MODE - No files will be modified\n');
  }

  files.forEach((file) => {
    const filePath = path.join(articlesDir, file);

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const { data, content: markdown } = matter(content);

      // Only migrate if image is simple string
      if (data.image && typeof data.image === 'string') {
        const originalImage = data.image;

        // Create new image object
        data.image = {
          src: originalImage,
          alt: `${data.title}`, // Use title as default alt text
          focusPoint: { x: 50, y: 50 }, // Default to center
        };

        if (!dryRun) {
          const newContent = matter.stringify(markdown, data);
          fs.writeFileSync(filePath, newContent);
        }

        result.migrated++;
        console.log(`✅ ${dryRun ? '[DRY RUN] ' : ''}Migrated: ${file}`);

        if (verbose) {
          console.log(`   Old: image: "${originalImage}"`);
          console.log(`   New: image:`);
          console.log(`          src: "${data.image.src}"`);
          console.log(`          alt: "${data.image.alt}"`);
          console.log(`          focusPoint: { x: 50, y: 50 }`);
        }
      } else if (!data.image) {
        result.skipped++;
        if (verbose) {
          console.log(`⏭️  Skipped: ${file} (no image)`);
        }
      } else {
        result.skipped++;
        if (verbose) {
          console.log(`⏭️  Skipped: ${file} (already migrated)`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Failed to process ${file}: ${errorMessage}`);
      console.error(`❌ Error: ${file} - ${errorMessage}`);
    }
  });

  console.log('\n📊 Migration Summary:');
  console.log(`   Total articles: ${result.total}`);
  console.log(`   Migrated: ${result.migrated}`);
  console.log(`   Skipped: ${result.skipped}`);
  console.log(`   Errors: ${result.errors.length}`);

  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach((err) => console.log(`   - ${err}`));
  }

  return result;
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');

  migrateArticleImages({ dryRun, verbose });
}
