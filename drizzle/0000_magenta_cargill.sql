CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	`impersonated_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`role` text DEFAULT 'subscriber',
	`banned` integer,
	`ban_reason` text,
	`ban_expires` integer,
	`last_active_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE TABLE `agenda_event` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`stat_text` text NOT NULL,
	`starts_at` integer,
	`ends_at` integer,
	`subtext` text NOT NULL,
	`image_url` text NOT NULL,
	`image_alt` text NOT NULL,
	`link_url` text,
	`cta_label` text,
	`year` integer NOT NULL,
	`format` text NOT NULL,
	`category` text NOT NULL,
	`visibility` text DEFAULT 'published' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`timezone` text,
	`venue_name` text,
	`city` text,
	`country` text,
	`registration_url` text,
	`created_by_user_id` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `agenda_event_slug_unique` ON `agenda_event` (`slug`);--> statement-breakpoint
CREATE INDEX `agenda_event_visibility_year_idx` ON `agenda_event` (`visibility`,`year`);--> statement-breakpoint
CREATE INDEX `agenda_event_starts_at_idx` ON `agenda_event` (`starts_at`);--> statement-breakpoint
CREATE TABLE `membership` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`tier_id` text,
	`status` text DEFAULT 'pending_payment' NOT NULL,
	`applied_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`valid_from` integer,
	`valid_until` integer,
	`member_number` text,
	`rejection_reason` text,
	`reviewed_at` integer,
	`reviewed_by_user_id` text,
	`notes` text,
	`card_version` integer DEFAULT 1 NOT NULL,
	`revoked_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tier_id`) REFERENCES `membership_tier`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `membership_member_number_unique` ON `membership` (`member_number`);--> statement-breakpoint
CREATE INDEX `membership_user_id_idx` ON `membership` (`user_id`);--> statement-breakpoint
CREATE INDEX `membership_status_valid_until_idx` ON `membership` (`status`,`valid_until`);--> statement-breakpoint
CREATE TABLE `membership_payment` (
	`id` text PRIMARY KEY NOT NULL,
	`membership_id` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'IDR' NOT NULL,
	`proof_object_key` text,
	`original_filename` text,
	`mime_type` text,
	`submitted_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`payer_note` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`reviewed_at` integer,
	`reviewer_user_id` text,
	`reviewer_note` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`membership_id`) REFERENCES `membership`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reviewer_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `membership_payment_membership_id_idx` ON `membership_payment` (`membership_id`);--> statement-breakpoint
CREATE TABLE `membership_tier` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`fee_amount` integer NOT NULL,
	`currency` text DEFAULT 'IDR' NOT NULL,
	`duration_months` integer,
	`validity_days` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `membership_tier_is_active_idx` ON `membership_tier` (`is_active`);--> statement-breakpoint
CREATE TABLE `publication` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`takeaways_json` text NOT NULL,
	`authors` text NOT NULL,
	`venue` text NOT NULL,
	`cover_image_url` text NOT NULL,
	`cover_image_alt` text NOT NULL,
	`link_url` text,
	`read_more_label` text,
	`publication_type` text,
	`published_at` integer,
	`doi` text,
	`isbn` text,
	`pdf_object_key` text,
	`featured` integer DEFAULT false NOT NULL,
	`visibility` text DEFAULT 'published' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `publication_slug_unique` ON `publication` (`slug`);--> statement-breakpoint
CREATE INDEX `publication_visibility_featured_idx` ON `publication` (`visibility`,`featured`);--> statement-breakpoint
CREATE INDEX `publication_published_at_idx` ON `publication` (`published_at`);