import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
};

export const editions = sqliteTable("editions", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  destination: text("destination").notNull(),
  startsAt: text("starts_at").notNull(),
  endsAt: text("ends_at").notNull(),
  status: text("status").notNull().default("DRAFT"),
  capacity: integer("capacity").notNull(),
  ...timestamps,
});

export const priceBatches = sqliteTable("price_batches", {
  id: text("id").primaryKey(),
  editionId: text("edition_id").notNull().references(() => editions.id),
  name: text("name").notNull(),
  amountCents: integer("amount_cents").notNull(),
  installmentCount: integer("installment_count").notNull().default(1),
  validFrom: text("valid_from"),
  validUntil: text("valid_until"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

export const availability = sqliteTable("availability", {
  editionId: text("edition_id").primaryKey().references(() => editions.id),
  reserved: integer("reserved").notNull().default(0),
  sold: integer("sold").notNull().default(0),
  version: integer("version").notNull().default(1),
  updatedAt: text("updated_at").notNull(),
});

export const leads = sqliteTable("leads", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  normalizedEmail: text("normalized_email").notNull(),
  phone: text("phone").notNull(),
  normalizedPhone: text("normalized_phone").notNull(),
  instagram: text("instagram"),
  company: text("company"),
  cityState: text("city_state"),
  editionId: text("edition_id").references(() => editions.id),
  stage: text("stage").notNull().default("NOVO"),
  consentVersion: text("consent_version").notNull(),
  consentAt: text("consent_at").notNull(),
  sourceSystem: text("source_system").notNull().default("platform"),
  externalId: text("external_id"),
  dedupeKey: text("dedupe_key").notNull().unique(),
  ...timestamps,
}, (table) => [
  index("leads_normalized_email_idx").on(table.normalizedEmail),
  index("leads_normalized_phone_idx").on(table.normalizedPhone),
  index("leads_stage_idx").on(table.stage),
  uniqueIndex("leads_source_external_uidx").on(table.sourceSystem, table.externalId),
]);

export const leadAnswers = sqliteTable("lead_answers", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").notNull().references(() => leads.id),
  answersJson: text("answers_json").notNull(),
  createdAt: text("created_at").notNull(),
});

export const leadAttribution = sqliteTable("lead_attribution", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").notNull().references(() => leads.id),
  touchType: text("touch_type").notNull(),
  landingUrl: text("landing_url").notNull(),
  referrer: text("referrer"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  utmContent: text("utm_content"),
  utmTerm: text("utm_term"),
  createdAt: text("created_at").notNull(),
}, (table) => [uniqueIndex("lead_touch_uidx").on(table.leadId, table.touchType)]);

export const pipelineHistory = sqliteTable("pipeline_history", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").notNull().references(() => leads.id),
  fromStage: text("from_stage"),
  toStage: text("to_stage").notNull(),
  actorId: text("actor_id"),
  reason: text("reason"),
  createdAt: text("created_at").notNull(),
});

export const activities = sqliteTable("activities", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").notNull().references(() => leads.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  actorId: text("actor_id"),
  dueAt: text("due_at"),
  completedAt: text("completed_at"),
  createdAt: text("created_at").notNull(),
});

export const assignments = sqliteTable("assignments", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").notNull().references(() => leads.id),
  userId: text("user_id").notNull(),
  assignedBy: text("assigned_by").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
});

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").references(() => leads.id),
  channel: text("channel").notNull(),
  externalId: text("external_id").notNull(),
  humanActive: integer("human_active", { mode: "boolean" }).notNull().default(false),
  optedOutAt: text("opted_out_at"),
  ...timestamps,
}, (table) => [uniqueIndex("conversation_external_uidx").on(table.channel, table.externalId)]);

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").notNull().references(() => conversations.id),
  externalId: text("external_id"),
  direction: text("direction").notNull(),
  type: text("type").notNull(),
  body: text("body"),
  status: text("status").notNull(),
  templateName: text("template_name"),
  payloadJson: text("payload_json"),
  createdAt: text("created_at").notNull(),
}, (table) => [uniqueIndex("messages_external_uidx").on(table.externalId)]);

export const checkouts = sqliteTable("checkouts", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").notNull().references(() => leads.id),
  editionId: text("edition_id").notNull().references(() => editions.id),
  priceBatchId: text("price_batch_id").notNull().references(() => priceBatches.id),
  provider: text("provider").notNull().default("asaas"),
  providerCustomerId: text("provider_customer_id"),
  providerPaymentId: text("provider_payment_id"),
  method: text("method").notNull(),
  amountCents: integer("amount_cents").notNull(),
  url: text("url"),
  status: text("status").notNull(),
  idempotencyKey: text("idempotency_key").notNull().unique(),
  authorizedBy: text("authorized_by").notNull(),
  ...timestamps,
});

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  checkoutId: text("checkout_id").notNull().references(() => checkouts.id),
  providerPaymentId: text("provider_payment_id").notNull().unique(),
  status: text("status").notNull(),
  amountCents: integer("amount_cents").notNull(),
  paidAt: text("paid_at"),
  payloadJson: text("payload_json"),
  ...timestamps,
});

export const refunds = sqliteTable("refunds", {
  id: text("id").primaryKey(),
  paymentId: text("payment_id").notNull().references(() => payments.id),
  providerRefundId: text("provider_refund_id").notNull().unique(),
  amountCents: integer("amount_cents").notNull(),
  status: text("status").notNull(),
  ...timestamps,
});

export const webhookEvents = sqliteTable("webhook_events", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull(),
  externalId: text("external_id").notNull(),
  eventType: text("event_type").notNull(),
  payloadJson: text("payload_json").notNull(),
  processedAt: text("processed_at"),
  error: text("error"),
  createdAt: text("created_at").notNull(),
}, (table) => [uniqueIndex("webhook_provider_external_uidx").on(table.provider, table.externalId)]);

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

export const roles = sqliteTable("roles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  role: text("role").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [uniqueIndex("user_role_uidx").on(table.userId, table.role)]);

export const auditLog = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  actorId: text("actor_id"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  beforeJson: text("before_json"),
  afterJson: text("after_json"),
  ip: text("ip"),
  createdAt: text("created_at").notNull(),
});

export const idempotencyKeys = sqliteTable("idempotency_keys", {
  key: text("key").primaryKey(),
  scope: text("scope").notNull(),
  resourceId: text("resource_id").notNull(),
  responseJson: text("response_json").notNull(),
  createdAt: text("created_at").notNull(),
});

export const outboxEvents = sqliteTable("outbox_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  aggregateId: text("aggregate_id").notNull(),
  payloadJson: text("payload_json").notNull(),
  attempts: integer("attempts").notNull().default(0),
  publishedAt: text("published_at"),
  lastError: text("last_error"),
  createdAt: text("created_at").notNull(),
});
