import { pgTable, uuid, varchar, integer, timestamp, text, jsonb, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Plataformas aliadas autorizadas para enviar/recibir datos
export const platforms = pgTable('platforms', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  webhookUrl: text('webhook_url'),
  apiKeyHash: text('api_key_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Registro Maestro Único (Generado tras la deduplicación)
export const unifiedPersons = pgTable('unified_persons', {
  id: uuid('id').defaultRandom().primaryKey(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  documentId: varchar('document_id', { length: 50 }), // Cédula de Identidad (V- / E-)
  age: integer('age'),
  gender: varchar('gender', { length: 50 }),
  status: varchar('status', { length: 50 }).default('desaparecido').notNull(), // desaparecido, localizado_sano, fallecido, verificando
  lastSeenLocation: text('last_seen_location'),
  lastSeenDate: timestamp('last_seen_date'),
  additionalDetails: text('additional_details'),
  reporterContact: varchar('reporter_contact', { length: 255 }),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Registros crudos provenientes de cada plataforma individual
export const platformReports = pgTable('platform_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  platformId: uuid('platform_id').references(() => platforms.id).notNull(),
  unifiedPersonId: uuid('unified_person_id').references(() => unifiedPersons.id), // Null si está pendiente de revisión por duplicado
  externalId: varchar('external_id', { length: 255 }).notNull(), // ID en la web de origen
  rawFirstName: varchar('raw_first_name', { length: 255 }).notNull(),
  rawLastName: varchar('raw_last_name', { length: 255 }).notNull(),
  rawDocumentId: varchar('raw_document_id', { length: 50 }),
  rawStatus: varchar('raw_status', { length: 50 }).notNull(),
  rawPhotoUrl: text('raw_photo_url'),
  contactInfoEncrypted: text('contact_info_encrypted'), // Protegido
  rawJson: jsonb('raw_json').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 4. Cola de posibles duplicados para moderación humana
export const potentialDuplicates = pgTable('potential_duplicates', {
  id: uuid('id').defaultRandom().primaryKey(),
  unifiedPersonId: uuid('unified_person_id').references(() => unifiedPersons.id).notNull(),
  platformReportId: uuid('platform_report_id').references(() => platformReports.id).notNull(),
  confidenceScore: integer('confidence_score').notNull(), // Porcentaje de similitud (0-100)
  status: varchar('status', { length: 50 }).default('pendiente').notNull(), // pendiente, aprobado, rechazado
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Automatización de Noticias (Resúmenes de Gemini)
export const newsSummaries = pgTable('news_summaries', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(), // El texto/viñetas resumidas por Gemini
  sourceUrl: text('source_url'), // Link original de la noticia si aplica
  sourceName: varchar('source_name', { length: 100 }), // Ej. "El Pitazo", "Protección Civil"
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 6. Centros de Acopio y Donaciones
export const collectionCenters = pgTable('collection_centers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address').notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  neededItems: text('needed_items'), // Ej. "Agua, Ropa, Medicinas"
  contactPhone: varchar('contact_phone', { length: 50 }),
  status: varchar('status', { length: 50 }).default('pendiente').notNull(), // pendiente, aprobado
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 7. Aportes de información de la comunidad
export const personTips = pgTable('person_tips', {
  id: uuid('id').defaultRandom().primaryKey(),
  unifiedPersonId: uuid('unified_person_id').references(() => unifiedPersons.id).notNull(),
  informationText: text('information_text').notNull(),
  status: varchar('status', { length: 50 }).default('aprobado').notNull(), // aprobado, rechazado
  aiModerationReason: text('ai_moderation_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 8. Llaves API (Para plataformas aliadas)
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: varchar('key', { length: 64 }).notNull().unique(),
  platformName: varchar('platform_name', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 9. Webhooks registrados
export const webhooks = pgTable('webhooks', {
  id: uuid('id').defaultRandom().primaryKey(),
  apiKeyId: uuid('api_key_id').references(() => apiKeys.id).notNull(),
  url: varchar('url', { length: 1024 }).notNull(),
  events: varchar('events', { length: 255 }).default('all').notNull(), // ej. "all", "person.created", "person.updated"
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relaciones
export const unifiedPersonsRelations = relations(unifiedPersons, ({ many }) => ({
  tips: many(personTips),
}));

export const personTipsRelations = relations(personTips, ({ one }) => ({
  person: one(unifiedPersons, {
    fields: [personTips.unifiedPersonId],
    references: [unifiedPersons.id],
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ many }) => ({
  webhooks: many(webhooks),
}));

export const webhooksRelations = relations(webhooks, ({ one }) => ({
  apiKey: one(apiKeys, {
    fields: [webhooks.apiKeyId],
    references: [apiKeys.id],
  }),
}));
