import { describe, it, expect } from 'vitest';
import { parseCMSConfig, getCollection, findField, type CMSFileConfig, type CMSField } from '../utils/cmsConfigParser';
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

    it('should configure image field with enhanced-image widget', () => {
      const config = parseCMSConfig(CMS_CONFIG_PATH);
      const articlesCollection = getCollection(config, 'articles');

      const imageField = findField(articlesCollection!.fields!, 'image');

      expect(imageField).toBeDefined();
      // The custom enhanced-image widget handles the enhanced image structure internally
      expect(imageField?.widget).toBe('enhanced-image');
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

      const booleanFieldsDefaults: Record<string, boolean> = {
        'featured': false,
        'important': false,
        'draft': true
      };

      Object.entries(booleanFieldsDefaults).forEach(([fieldName, expectedDefault]) => {
        const field = findField(articlesCollection!.fields!, fieldName);
        expect(field).toBeDefined();
        expect(field?.widget).toBe('boolean');
        expect(field?.default).toBe(expectedDefault);
      });
    });

    it('should validate publishedAt date format', () => {
      const config = parseCMSConfig(CMS_CONFIG_PATH);
      const articlesCollection = getCollection(config, 'articles');

      const publishedAtField = findField(articlesCollection!.fields!, 'publishedAt');

      expect(publishedAtField).toBeDefined();
      expect(publishedAtField?.widget).toBe('datetime');
      expect(publishedAtField?.format).toBe('DD.MM.YYYY');
      expect(publishedAtField?.date_format).toBe('DD.MM.YYYY');
      expect(publishedAtField?.time_format).toBe(false);
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
      const optionalFields = ['description', 'section', 'order', 'draft'];
      optionalFields.forEach(fieldName => {
        expect(fieldNames).toContain(fieldName);
      });
    });

    it('should configure order as number widget', () => {
      const config = parseCMSConfig(CMS_CONFIG_PATH);
      const pagesCollection = getCollection(config, 'pages');

      const orderField = findField(pagesCollection!.fields!, 'order');

      expect(orderField).toBeDefined();
      expect(orderField?.widget).toBe('number');
      expect(orderField?.required).toBe(false);
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
        publishedAt: 'datetime',
        author: 'author',
        tags: 'list',
        image: 'enhanced-image',
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
        draft: 'boolean',
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

      const contactsFile = settingsCollection!.files!.find((f: CMSFileConfig) => f.name === 'contacts');
      expect(contactsFile).toBeDefined();
      expect(contactsFile!.fields).toBeDefined();

      const fieldNames = contactsFile!.fields.map((f: CMSField) => f.name);
      expect(fieldNames).toContain('school');
      expect(fieldNames).toContain('cafeteria');
      expect(fieldNames).toContain('socialMedia');
    });

    it('should have navigation collection with correct structure', () => {
      const config = parseCMSConfig(CMS_CONFIG_PATH);
      const settingsCollection = getCollection(config, 'settings');

      const navigationFile = settingsCollection!.files!.find((f: CMSFileConfig) => f.name === 'navigation');
      expect(navigationFile).toBeDefined();

      const sectionsField = findField(navigationFile!.fields, 'sections');
      expect(sectionsField?.widget).toBe('list');
    });

    it.skip('should have sponsors collection with correct structure', () => {
      // TODO: Add sponsors to CMS config if they should be editable through admin
      // Currently sponsors are managed directly in JSON file
      const config = parseCMSConfig(CMS_CONFIG_PATH);
      const settingsCollection = getCollection(config, 'settings');

      const sponsorsFile = settingsCollection!.files!.find((f: CMSFileConfig) => f.name === 'sponsors');
      expect(sponsorsFile).toBeDefined();

      const partnersField = findField(sponsorsFile!.fields, 'partners');
      expect(partnersField?.widget).toBe('list');

      // Verify partners have logo field as image
      const partnerFields = partnersField!.fields!;
      const logoField = findField(partnerFields, 'logo');
      expect(logoField?.widget).toBe('image');
    });
  });
});
