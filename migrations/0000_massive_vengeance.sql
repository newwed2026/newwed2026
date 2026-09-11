CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`body` text,
	`actor_id` text,
	`due_at` text,
	`completed_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_id` text NOT NULL,
	`user_id` text NOT NULL,
	`assigned_by` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`before_json` text,
	`after_json` text,
	`ip` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `availability` (
	`edition_id` text PRIMARY KEY NOT NULL,
	`reserved` integer DEFAULT 0 NOT NULL,
	`sold` integer DEFAULT 0 NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`edition_id`) REFERENCES `editions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `checkouts` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_id` text NOT NULL,
	`edition_id` text NOT NULL,
	`price_batch_id` text NOT NULL,
	`provider` text DEFAULT 'asaas' NOT NULL,
	`provider_customer_id` text,
	`provider_payment_id` text,
	`method` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`url` text,
	`status` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`authorized_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`edition_id`) REFERENCES `editions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`price_batch_id`) REFERENCES `price_batches`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `checkouts_idempotency_key_unique` ON `checkouts` (`idempotency_key`);--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_id` text,
	`channel` text NOT NULL,
	`external_id` text NOT NULL,
	`human_active` integer DEFAULT false NOT NULL,
	`opted_out_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `conversation_external_uidx` ON `conversations` (`channel`,`external_id`);--> statement-breakpoint
CREATE TABLE `editions` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`destination` text NOT NULL,
	`starts_at` text NOT NULL,
	`ends_at` text NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`capacity` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `editions_slug_unique` ON `editions` (`slug`);--> statement-breakpoint
CREATE TABLE `idempotency_keys` (
	`key` text PRIMARY KEY NOT NULL,
	`scope` text NOT NULL,
	`resource_id` text NOT NULL,
	`response_json` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `lead_answers` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_id` text NOT NULL,
	`answers_json` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `lead_attribution` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_id` text NOT NULL,
	`touch_type` text NOT NULL,
	`landing_url` text NOT NULL,
	`referrer` text,
	`utm_source` text,
	`utm_medium` text,
	`utm_campaign` text,
	`utm_content` text,
	`utm_term` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lead_touch_uidx` ON `lead_attribution` (`lead_id`,`touch_type`);--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`normalized_email` text NOT NULL,
	`phone` text NOT NULL,
	`normalized_phone` text NOT NULL,
	`instagram` text,
	`company` text,
	`city_state` text,
	`edition_id` text,
	`stage` text DEFAULT 'NOVO' NOT NULL,
	`consent_version` text NOT NULL,
	`consent_at` text NOT NULL,
	`source_system` text DEFAULT 'platform' NOT NULL,
	`external_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`edition_id`) REFERENCES `editions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `leads_normalized_email_idx` ON `leads` (`normalized_email`);--> statement-breakpoint
CREATE INDEX `leads_normalized_phone_idx` ON `leads` (`normalized_phone`);--> statement-breakpoint
CREATE INDEX `leads_stage_idx` ON `leads` (`stage`);--> statement-breakpoint
CREATE UNIQUE INDEX `leads_source_external_uidx` ON `leads` (`source_system`,`external_id`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`external_id` text,
	`direction` text NOT NULL,
	`type` text NOT NULL,
	`body` text,
	`status` text NOT NULL,
	`template_name` text,
	`payload_json` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `messages_external_uidx` ON `messages` (`external_id`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`checkout_id` text NOT NULL,
	`provider_payment_id` text NOT NULL,
	`status` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`paid_at` text,
	`payload_json` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`checkout_id`) REFERENCES `checkouts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_provider_payment_id_unique` ON `payments` (`provider_payment_id`);--> statement-breakpoint
CREATE TABLE `pipeline_history` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_id` text NOT NULL,
	`from_stage` text,
	`to_stage` text NOT NULL,
	`actor_id` text,
	`reason` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `price_batches` (
	`id` text PRIMARY KEY NOT NULL,
	`edition_id` text NOT NULL,
	`name` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`installment_count` integer DEFAULT 1 NOT NULL,
	`valid_from` text,
	`valid_until` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`edition_id`) REFERENCES `editions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `refunds` (
	`id` text PRIMARY KEY NOT NULL,
	`payment_id` text NOT NULL,
	`provider_refund_id` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `refunds_provider_refund_id_unique` ON `refunds` (`provider_refund_id`);--> statement-breakpoint
CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_role_uidx` ON `roles` (`user_id`,`role`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `webhook_events` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`external_id` text NOT NULL,
	`event_type` text NOT NULL,
	`payload_json` text NOT NULL,
	`processed_at` text,
	`error` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `webhook_provider_external_uidx` ON `webhook_events` (`provider`,`external_id`);
--> statement-breakpoint
INSERT INTO `editions` (`id`,`slug`,`name`,`destination`,`starts_at`,`ends_at`,`status`,`capacity`,`created_at`,`updated_at`) VALUES
('famtour-alagoas-fevereiro-2027','famtour-alagoas-fevereiro-2027','Famtour Alagoas','Alagoas','2027-02-21','2027-02-25','OPEN',18,datetime('now'),datetime('now')),
('famtour-rn-abril-2027','famtour-rn-abril-2027','Famtour Rio Grande do Norte','Rio Grande do Norte','2027-04-04','2027-04-08','OPEN',18,datetime('now'),datetime('now')),
('famtour-noronha-maio-2027','famtour-noronha-maio-2027','Famtour Fernando de Noronha','Fernando de Noronha','2027-05-02','2027-05-06','OPEN',15,datetime('now'),datetime('now')),
('famtour-ceara-agosto-2027','famtour-ceara-agosto-2027','Famtour Ceará','Ceará','2027-08-15','2027-08-19','OPEN',18,datetime('now'),datetime('now'));
--> statement-breakpoint
INSERT INTO `price_batches` (`id`,`edition_id`,`name`,`amount_cents`,`installment_count`,`active`,`created_at`,`updated_at`) VALUES
('batch-alagoas-2027','famtour-alagoas-fevereiro-2027','Lote atual',769700,12,1,datetime('now'),datetime('now')),
('batch-rn-2027','famtour-rn-abril-2027','Lote atual',699700,12,1,datetime('now'),datetime('now')),
('batch-noronha-2027','famtour-noronha-maio-2027','Lote atual',799700,12,1,datetime('now'),datetime('now')),
('batch-ceara-2027','famtour-ceara-agosto-2027','Lote atual',699700,12,1,datetime('now'),datetime('now'));
--> statement-breakpoint
INSERT INTO `availability` (`edition_id`,`reserved`,`sold`,`version`,`updated_at`) VALUES
('famtour-alagoas-fevereiro-2027',0,0,1,datetime('now')),
('famtour-rn-abril-2027',0,0,1,datetime('now')),
('famtour-noronha-maio-2027',0,0,1,datetime('now')),
('famtour-ceara-agosto-2027',0,0,1,datetime('now'));
