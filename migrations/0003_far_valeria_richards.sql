ALTER TABLE `checkouts` ADD `processing_token` text;--> statement-breakpoint
ALTER TABLE `checkouts` ADD `processing_started_at` text;--> statement-breakpoint
ALTER TABLE `checkouts` ADD `retry_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `checkouts` ADD `next_retry_at` text;--> statement-breakpoint
ALTER TABLE `outbox_events` ADD `dedupe_key` text;--> statement-breakpoint
ALTER TABLE `outbox_events` ADD `next_attempt_at` text;--> statement-breakpoint
CREATE UNIQUE INDEX `outbox_events_dedupe_key_unique` ON `outbox_events` (`dedupe_key`);--> statement-breakpoint
CREATE INDEX `outbox_pending_idx` ON `outbox_events` (`published_at`,`next_attempt_at`,`created_at`);--> statement-breakpoint
ALTER TABLE `webhook_events` ADD `attempts` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `webhook_events` ADD `last_attempt_at` text;--> statement-breakpoint
ALTER TABLE `webhook_events` ADD `next_retry_at` text;--> statement-breakpoint
CREATE INDEX `webhook_pending_retry_idx` ON `webhook_events` (`provider`,`processed_at`,`next_retry_at`);