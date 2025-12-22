import { defineCollection, z } from 'astro:content';

// Legacy image format (simple string path)
const legacyImageSchema = z.string();

// Enhanced image format (object with metadata)
const enhancedImageSchema = z.object({
  src: z.string(),
  alt: z.string().optional(),
  focusPoint: z
    .object({
      x: z.number().min(0).max(100),
      y: z.number().min(0).max(100),
    })
    .optional(),
  crops: z
    .object({
      hero: z
        .object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
        })
        .optional(),
      card: z
        .object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
        })
        .optional(),
      thumbnail: z
        .object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
        })
        .optional(),
      detail: z
        .object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
        })
        .optional(),
    })
    .optional(),
});

// Union type: supports both legacy string and enhanced object formats
const imageSchema = z.union([legacyImageSchema, enhancedImageSchema]).optional();

// Articles collection schema
const articlesCollection = defineCollection({
  type: 'content', // Markdown files with frontmatter
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    publishedAt: z.string(), // Keep as string (DD.MM.YYYY format)
    author: z.string(),
    tags: z.array(z.string()).default([]),
    image: imageSchema,
    featured: z.boolean().default(false),
    important: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

// Pages collection schema
const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    section: z.string().optional(),
    order: z.number().default(0),
    hideFromNav: z.boolean().default(false),
    draft: z.boolean().default(false),
    author: z.string().optional(),
  }),
});

// Settings collections (JSON files)
const contactsCollection = defineCollection({
  type: 'data', // JSON/YAML files
  schema: z.object({
    school: z.object({
      name: z.string(),
      address: z.string(),
      city: z.string(),
      phone: z.string(),
      email: z.string(),
      ico: z.string(),
      dic: z.string(),
      bankAccount: z.string(),
    }),
    cafeteria: z.object({
      phone: z.string(),
      email: z.string(),
      submission: z.string(),
    }),
    socialMedia: z.object({
      facebook: z.string(),
      instagram: z.string(),
    }),
  }),
});

const navigationCollection = defineCollection({
  type: 'data',
  schema: z.object({
    sections: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        url: z.string(),
        color: z.string(),
        subsections: z
          .array(
            z.object({
              title: z.string(),
              url: z.string(),
            }),
          )
          .optional(),
      }),
    ),
  }),
});

const quickLinksCollection = defineCollection({
  type: 'data',
  schema: z.object({
    links: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        color: z.string(),
      }),
    ),
  }),
});

const sponsorsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    partners: z.array(
      z.object({
        name: z.string(),
        logo: z.string(), // Path to logo image
        url: z.string().optional(), // Optional URL to partner website
        alt: z.string(), // Alt text for accessibility
        order: z.number().default(0), // Display order
      }),
    ),
  }),
});

const authorsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    mappings: z.array(
      z.object({
        github: z.string(),
        displayName: z.string(),
      })
    ),
    defaultAuthor: z.string(),
  }),
});

// Export collections
export const collections = {
  articles: articlesCollection,
  pages: pagesCollection,
  contacts: contactsCollection,
  navigation: navigationCollection,
  'quick-links': quickLinksCollection,
  sponsors: sponsorsCollection,
  authors: authorsCollection,
};
