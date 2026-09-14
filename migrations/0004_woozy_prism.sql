ALTER TABLE `conversations` ADD `agent_processing_token` text;--> statement-breakpoint
ALTER TABLE `conversations` ADD `agent_processing_started_at` text;--> statement-breakpoint
ALTER TABLE `messages` ADD `actor_id` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `messages` ADD `last_error` text;--> statement-breakpoint
ALTER TABLE `messages` ADD `accepted_at` text;--> statement-breakpoint
ALTER TABLE `messages` ADD `failed_at` text;