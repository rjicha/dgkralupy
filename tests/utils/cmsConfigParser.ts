import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

export interface CMSField {
  label: string;
  name: string;
  widget: string;
  required?: boolean;
  default?: any;
  fields?: CMSField[];
  pattern?: [string, string];
  hint?: string;
}

export interface CMSCollection {
  name: string;
  label: string;
  folder?: string;
  file?: string;
  files?: any[];
  fields?: CMSField[];
}

export interface CMSConfig {
  collections: CMSCollection[];
}

/**
 * Parse the CMS configuration file
 */
export function parseCMSConfig(configPath: string): CMSConfig {
  const configContent = fs.readFileSync(configPath, 'utf8');
  const config = yaml.load(configContent) as any;

  return {
    collections: config.collections || [],
  };
}

/**
 * Get a specific collection from the CMS config
 */
export function getCollection(config: CMSConfig, collectionName: string): CMSCollection | undefined {
  return config.collections.find(c => c.name === collectionName);
}

/**
 * Extract field definitions from a collection
 */
export function getCollectionFields(collection: CMSCollection): CMSField[] {
  if (collection.fields) {
    return collection.fields;
  }

  // For file-based collections, fields are in the files array
  if (collection.files && collection.files.length > 0) {
    return collection.files[0].fields || [];
  }

  return [];
}

/**
 * Recursively find a field by name in a collection
 */
export function findField(fields: CMSField[], fieldName: string): CMSField | undefined {
  for (const field of fields) {
    if (field.name === fieldName) {
      return field;
    }

    // Search in nested fields (for object widgets)
    if (field.fields) {
      const nestedField = findField(field.fields, fieldName);
      if (nestedField) {
        return nestedField;
      }
    }
  }

  return undefined;
}

/**
 * Map CMS widget types to expected schema types
 */
export const widgetToTypeMap: Record<string, string[]> = {
  string: ['string'],
  text: ['string'],
  markdown: ['string'],
  boolean: ['boolean'],
  number: ['number'],
  datetime: ['string', 'Date'],
  image: ['string'],
  file: ['string'],
  list: ['array'],
  object: ['object'],
  select: ['string'],
  relation: ['string'],
  'author-auto': ['string'],
};

/**
 * Get expected schema type from CMS widget type
 */
export function getExpectedType(widget: string): string[] {
  return widgetToTypeMap[widget] || ['unknown'];
}
