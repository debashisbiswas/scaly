CREATE TABLE `exercise_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`exercise_id` text NOT NULL,
	`rating` text NOT NULL,
	`performed_at` integer NOT NULL,
	`bpm_used` integer,
	`notes_hidden` integer,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `exercise_attempts_exercise_time_idx` ON `exercise_attempts` (`exercise_id`,`performed_at`);--> statement-breakpoint
CREATE TABLE `exercise_srs_state` (
	`exercise_id` text PRIMARY KEY NOT NULL,
	`due_at` integer NOT NULL,
	`last_reviewed_at` integer,
	`interval_days` real NOT NULL,
	`ease_factor` real NOT NULL,
	`reps` integer NOT NULL,
	`lapses` integer NOT NULL,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `exercise_srs_due_idx` ON `exercise_srs_state` (`due_at`);--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`flow_id` text NOT NULL,
	`position` integer NOT NULL,
	`exercise_key` text NOT NULL,
	`key` text NOT NULL,
	`mode` text NOT NULL,
	`rhythm_pattern` text NOT NULL,
	`slur_pattern` text NOT NULL,
	`start_octave` integer NOT NULL,
	`octaves` integer NOT NULL,
	`clef` text NOT NULL,
	`tempo_kind` text NOT NULL,
	`tempo_bpm` integer,
	`tempo_min_bpm` integer,
	`tempo_max_bpm` integer,
	`created_at` integer NOT NULL,
	`archived_at` integer,
	FOREIGN KEY (`flow_id`) REFERENCES `flows`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exercises_flow_position_uq` ON `exercises` (`flow_id`,`position`);--> statement-breakpoint
CREATE UNIQUE INDEX `exercises_flow_key_uq` ON `exercises` (`flow_id`,`exercise_key`);--> statement-breakpoint
CREATE INDEX `exercises_flow_idx` ON `exercises` (`flow_id`);--> statement-breakpoint
CREATE INDEX `exercises_due_archived_idx` ON `exercises` (`archived_at`);