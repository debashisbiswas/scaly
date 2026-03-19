CREATE TABLE `flow_draft` (
	`id` integer PRIMARY KEY NOT NULL,
	`draft_json` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `flows` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`config_json` text NOT NULL,
	`progress_percent` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
