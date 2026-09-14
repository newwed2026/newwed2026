CREATE TABLE `notification_recipients` (
	`id` text PRIMARY KEY NOT NULL,
	`notification_id` text NOT NULL,
	`user_id` text NOT NULL,
	`channel` text NOT NULL,
	`delivery_status` text DEFAULT 'PENDING' NOT NULL,
	`read_at` text,
	`sent_at` text,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`notification_id`) REFERENCES `notifications`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notification_recipient_channel_uidx` ON `notification_recipients` (`notification_id`,`user_id`,`channel`);--> statement-breakpoint
CREATE INDEX `notification_recipients_user_read_idx` ON `notification_recipients` (`user_id`,`read_at`,`created_at`);--> statement-breakpoint
CREATE INDEX `notification_recipients_delivery_idx` ON `notification_recipients` (`delivery_status`,`updated_at`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`dedupe_key` text NOT NULL,
	`payload_json` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notifications_dedupe_key_unique` ON `notifications` (`dedupe_key`);--> statement-breakpoint
CREATE INDEX `notifications_entity_idx` ON `notifications` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `notifications_created_at_idx` ON `notifications` (`created_at`);--> statement-breakpoint
ALTER TABLE `checkouts` ADD `provider_installment_id` text;--> statement-breakpoint
ALTER TABLE `checkouts` ADD `installment_count` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `checkouts` ADD `financial_status` text DEFAULT 'NOT_STARTED' NOT NULL;--> statement-breakpoint
ALTER TABLE `checkouts` ADD `send_status` text DEFAULT 'NOT_REQUESTED' NOT NULL;--> statement-breakpoint
ALTER TABLE `checkouts` ADD `expires_at` text;--> statement-breakpoint
ALTER TABLE `checkouts` ADD `last_error_code` text;--> statement-breakpoint
ALTER TABLE `checkouts` ADD `last_error` text;--> statement-breakpoint
ALTER TABLE `checkouts` ADD `last_error_at` text;--> statement-breakpoint
ALTER TABLE `checkouts` ADD `ready_at` text;--> statement-breakpoint
ALTER TABLE `checkouts` ADD `send_requested_at` text;--> statement-breakpoint
ALTER TABLE `checkouts` ADD `sent_at` text;--> statement-breakpoint
ALTER TABLE `checkouts` ADD `delivered_at` text;--> statement-breakpoint
ALTER TABLE `checkouts` ADD `pending_at` text;--> statement-breakpoint
ALTER TABLE `checkouts` ADD `paid_at` text;--> statement-breakpoint
ALTER TABLE `checkouts` ADD `cancelled_at` text;--> statement-breakpoint
ALTER TABLE `checkouts` ADD `refunded_at` text;--> statement-breakpoint
ALTER TABLE `checkouts` ADD `reservation_released_at` text;--> statement-breakpoint
ALTER TABLE `checkouts` ADD `version` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE INDEX `checkouts_status_idx` ON `checkouts` (`status`);--> statement-breakpoint
CREATE INDEX `checkouts_financial_status_idx` ON `checkouts` (`financial_status`);--> statement-breakpoint
CREATE INDEX `checkouts_send_status_idx` ON `checkouts` (`send_status`);--> statement-breakpoint
CREATE INDEX `checkouts_provider_installment_idx` ON `checkouts` (`provider_installment_id`);--> statement-breakpoint
ALTER TABLE `conversations` ADD `mode` text DEFAULT 'AGENT' NOT NULL;--> statement-breakpoint
ALTER TABLE `conversations` ADD `claimed_by` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `conversations` ADD `claimed_at` text;--> statement-breakpoint
ALTER TABLE `conversations` ADD `released_at` text;--> statement-breakpoint
ALTER TABLE `conversations` ADD `agent_paused_at` text;--> statement-breakpoint
ALTER TABLE `conversations` ADD `agent_error` text;--> statement-breakpoint
ALTER TABLE `conversations` ADD `summary` text;--> statement-breakpoint
ALTER TABLE `conversations` ADD `summarized_message_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `conversations` ADD `summary_updated_at` text;--> statement-breakpoint
ALTER TABLE `conversations` ADD `last_message_at` text;--> statement-breakpoint
CREATE INDEX `conversations_mode_updated_idx` ON `conversations` (`mode`,`updated_at`);--> statement-breakpoint
CREATE INDEX `conversations_claimed_by_idx` ON `conversations` (`claimed_by`);--> statement-breakpoint
ALTER TABLE `messages` ADD `checkout_id` text REFERENCES checkouts(id);--> statement-breakpoint
CREATE INDEX `messages_checkout_idx` ON `messages` (`checkout_id`);--> statement-breakpoint
ALTER TABLE `payments` ADD `provider_installment_id` text;--> statement-breakpoint
ALTER TABLE `payments` ADD `installment_number` integer;--> statement-breakpoint
ALTER TABLE `payments` ADD `due_date` text;