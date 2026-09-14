CREATE TABLE `rate_limit_buckets` (
	`key` text PRIMARY KEY NOT NULL,
	`scope` text NOT NULL,
	`window_started_at` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`expires_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `rate_limit_expiry_idx` ON `rate_limit_buckets` (`expires_at`);--> statement-breakpoint
ALTER TABLE `activities` ADD `assigned_to` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `activities` ADD `priority` text DEFAULT 'NORMAL' NOT NULL;--> statement-breakpoint
ALTER TABLE `activities` ADD `completed_by` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `activities` ADD `updated_at` text;--> statement-breakpoint
CREATE INDEX `activities_due_idx` ON `activities` (`completed_at`,`due_at`);--> statement-breakpoint
CREATE INDEX `activities_assigned_idx` ON `activities` (`assigned_to`,`completed_at`);--> statement-breakpoint
ALTER TABLE `audit_log` ADD `request_id` text;--> statement-breakpoint
ALTER TABLE `checkouts` ADD `request_id` text;--> statement-breakpoint
ALTER TABLE `conversations` ADD `request_id` text;--> statement-breakpoint
ALTER TABLE `leads` ADD `request_id` text;--> statement-breakpoint
ALTER TABLE `messages` ADD `request_id` text;--> statement-breakpoint
ALTER TABLE `notifications` ADD `request_id` text;--> statement-breakpoint
ALTER TABLE `outbox_events` ADD `request_id` text;--> statement-breakpoint
ALTER TABLE `webhook_events` ADD `request_id` text;
