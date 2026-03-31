ALTER TABLE `agenda_event` ADD `body_json` text;--> statement-breakpoint
ALTER TABLE `agenda_event` ADD `updated_by_user_id` text REFERENCES user(id);--> statement-breakpoint
CREATE INDEX `agenda_event_visibility_sort_order_idx` ON `agenda_event` (`visibility`,`sort_order`);--> statement-breakpoint
CREATE INDEX `agenda_event_category_year_idx` ON `agenda_event` (`category`,`year`);--> statement-breakpoint
CREATE INDEX `agenda_event_format_year_idx` ON `agenda_event` (`format`,`year`);--> statement-breakpoint
ALTER TABLE `publication` ADD `body_json` text;--> statement-breakpoint
ALTER TABLE `publication` ADD `created_by_user_id` text REFERENCES user(id);--> statement-breakpoint
ALTER TABLE `publication` ADD `updated_by_user_id` text REFERENCES user(id);--> statement-breakpoint
CREATE INDEX `publication_visibility_published_at_idx` ON `publication` (`visibility`,`published_at`);--> statement-breakpoint
CREATE INDEX `publication_visibility_sortorder_idx` ON `publication` (`visibility`,`sort_order`);--> statement-breakpoint
CREATE INDEX `publication_doi_idx` ON `publication` (`doi`);--> statement-breakpoint
CREATE INDEX `membership_tier_id_idx` ON `membership` (`tier_id`);--> statement-breakpoint
CREATE INDEX `membership_payment_status_idx` ON `membership_payment` (`status`);--> statement-breakpoint
CREATE INDEX `membership_payment_submitted_at_idx` ON `membership_payment` (`submitted_at`);