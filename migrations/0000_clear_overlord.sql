CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`host_id` text,
	`host_name` text,
	`photo_limit` integer DEFAULT 3 NOT NULL,
	`reveal_delay` integer DEFAULT 300 NOT NULL,
	`created_at` integer DEFAULT '"2025-03-14T18:12:12.254Z"' NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `photos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`user_id` text,
	`user_name` text,
	`image_url` text NOT NULL,
	`filter` text,
	`taken_at` integer DEFAULT '"2025-03-14T18:12:12.256Z"' NOT NULL
);
