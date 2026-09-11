CREATE TABLE `outbox_events` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`aggregate_id` text NOT NULL,
	`payload_json` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`published_at` text,
	`last_error` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `leads` ADD `dedupe_key` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `leads_dedupe_key_unique` ON `leads` (`dedupe_key`);