import { describe, it, expect } from 'vitest';
import { parseCMSConfig, getCollection, findField, getExpectedType } from '../utils/cmsConfigParser';
import path from 'path';

const CMS_CONFIG_PATH = path.resolve(__dirname, '../../public/admin/config.yml');

describe('CMS Configuration Schema Validation', () => {
  describe('Articles Collection', () => {
    it('should have all required schema fields defined in CMS config', () => {
      const config = parseCMSConfig(CMS_CONFIG_PATH);
      const articlesCollection = getCollection(config, 'articles');

      expect(articlesCollection).toBeDefined();
      expect(articlesCollection?.fields).toBeDefined();

      const fields = articlesCollection!.fields!;
      const fieldNames = fields.map(f => f.name);

      // Required fields from Zod schema
      const requiredFields = ['title', 'excerpt', 'publishedAt', 'author'];
      requiredFields.forEach(fieldName => {
        expect(fieldNames).toContain(fieldName);
      });

      // Optional fields from Zod schema
      const optionalFields = ['tags', 'image', 'featured', 'important', 'draft'];
      optionalFields.forEach(fieldName => {
        expect(fieldNames).toContain(fieldName);
      });
    });

    it('should configure image field with image-crop widget', () => {
      const config = parseCMSConfig(CMS_CONFIG_PATH);
      const articlesCollection = getCollection(config, 'articles');

      const imageField = findField(articlesCollection!.fields!, 'image');

      expect(imageField).toBeDefined();
      // The custom image-crop widget handles the enhanced image structure internally
      expect(imageField?.widget).toBe('image-crop');
      expect(imageField?.required).toBe(false);
    });


    it('should configure tags as list widget', () => {
      const config = parseCMSConfig(CMS_CONFIG_PATH);
      const articlesCollection = getCollection(config, 'articles');

      const tagsField = findField(articlesCollection!.fields!, 'tags');

      expect(tagsField).toBeDefined();
      expect(tagsField?.widget).toBe('list');
      expect(tagsField?.required).toBe(false);
    });

    it('should configure boolean fields correctly', () => {
      const config = parseCMSConfig(CMS_CONFIG_PATH);
      const articlesCollection = getCollection(config, 'articles');

      const booleanFields = ['featured', 'important', 'draft'];

      booleanFields.forEach(fieldName => {
        const field = findField(articlesCollection!.fields!, fieldName);
        expect(field).toBeDefined();
        expect(field?.widget).toBe('boolean');
        expect(field?.default).toBe(false);
      });
    });

    it('should validate publishedAt date format pattern', () => {
      const config = parseCMSConfig(CMS_CONFIG_PATH);
      const articlesCollection = getCollection(config, 'articles');

      const publishedAtField = findField(articlesCollection!.fields!, 'publishedAt');

      expect(publishedAtField).toBeDefined();
      expect(publishedAtField?.widget).toBe('string');
      expect(publishedAtField?.pattern).toBeDefined();

      // Pattern should validate DD.MM.YYYY format
      const [pattern] = publishedAtField!.pattern!;
      expect(pattern).toBe('^[0-3][0-9]\\.[0-1][0-9]\\.[0-9]{4}$');
    });
  });

  describe('Pages Collection', () => {
    it('should have all required schema fields defined in CMS config', () => {
      const config = parseCMSConfig(CMS_CONFIG_PATH);
      const pagesCollection = getCollection(config, 'pages');

      expect(pagesCollection).toBeDefined();
      expect(pagesCollection?.fields).toBeDefined();

      const fields = pagesCollection!.fields!;
      const fieldNames = fields.map(f => f.name);

      // Required fields from Zod schema
      expect(fieldNames).toContain('title');

      // Optional fields from Zod schema
      const optionalFields = ['description', 'section', 'order', 'hideFromNav', 'draft', 'author'];
      optionalFields.forEach(fieldName => {
        expect(fieldNames).toContain(fieldName);
      });
    });

    it('should configure order as number widget with default 0', () => {
      const config = parseCMSConfig(CMS_CONFIG_PATH);
      const pagesCollection = getCollection(config, 'pages');

      const orderField = findField(pagesCollection!.fields!, 'order');

      expect(orderField).toBeDefined();
      expect(orderField?.widget).toBe('number');
      expect(orderField?.default).toBe(0);
    });
  });

  describe('Type Consistency', () => {
    it('should use correct widget types for all article fields', () => {
      const config = parseCMSConfig(CMS_CONFIG_PATH);
      const articlesCollection = getCollection(config, 'articles');

      const expectedWidgets = {
        title: 'string',
        excerpt: 'text',
        body: 'markdown',
        publishedAt: 'string',
        author: 'author-auto',
        tags: 'list',
        image: 'image-crop',
        featured: 'boolean',
        important: 'boolean',
        draft: 'boolean',
      };

      Object.entries(expectedWidgets).forEach(([fieldName, expectedWidget]) => {
        const field = findField(articlesCollection!.fields!, fieldName);
        expect(field?.widget).toBe(expectedWidget);
      });
    });

    it('should use correct widget types for all page fields', () => {
      const config = parseCMSConfig(CMS_CONFIG_PATH);
      const pagesCollection = getCollection(config, 'pages');

      const expectedWidgets = {
        title: 'string',
        description: 'text',
        body: 'markdown',
        section: 'select',
        order: 'number',
        hideFromNav: 'boolean',
        draft: 'boolean',
        author: 'author-auto',
      };

      Object.entries(expectedWidgets).forEach(([fieldName, expectedWidget]) => {
        const field = findField(pagesCollection!.fields!, fieldName);
        expect(field?.widget).toBe(expectedWidget);
      });
    });
  });

  describe('Settings Collections', () => {
    it('should have contacts collection with correct structure', () => {
      const config = parseCMSConfig(CMS_CONFIG_PATH);
      const settingsCollection = getCollection(config, 'settings');

      expect(settingsCollection).toBeDefined();
      expect(settingsCollection?.files).toBeDefined();

      const contactsFile = settingsCollection!.files!.find((f: any) => f.name === 'contacts');
      expect(contactsFile).toBeDefined();
      expect(contactsFile.fields).toBeDefined();

      const fieldNames = contactsFile.fields.map((f: any) => f.name);
      expect(fieldNames).toContain('school');
      expect(fieldNames).toContain('cafeteria');
      expect(fieldNames).toContain('socialMedia');
    });

    it('should have navigation collection with correct structure', () => {
      const config = parseCMSConfig(CMS_CONFIG_PATH);
      const settingsCollection = getCollection(config, 'settings');

      const navigationFile = settingsCollection!.files!.find((f: any) => f.name === 'navigation');
      expect(navigationFile).toBeDefined();

      const sectionsField = findField(navigationFile.fields, 'sections');
      expect(sectionsField?.widget).toBe('list');
    });

    it('should have sponsors collection with correct structure', () => {
      const config = parseCMSConfig(CMS_CONFIG_PATH);
      const settingsCollection = getCollection(config, 'settings');

      const sponsorsFile = settingsCollection!.files!.find((f: any) => f.name === 'sponsors');
      expect(sponsorsFile).toBeDefined();

      const partnersField = findField(sponsorsFile.fields, 'partners');
      expect(partnersField?.widget).toBe('list');

      // Verify partners have logo field as image
      const partnerFields = partnersField!.fields!;
      const logoField = findField(partnerFields, 'logo');
      expect(logoField?.widget).toBe('image');
    });
  });
});
