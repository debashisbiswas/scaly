CREATE TABLE `exercise_practice_stats` (
	`exercise_id` text PRIMARY KEY NOT NULL,
	`total_attempts` integer NOT NULL,
	`again_count` integer NOT NULL,
	`hard_count` integer NOT NULL,
	`good_count` integer NOT NULL,
	`easy_count` integer NOT NULL,
	`last_rating` text,
	`last_rated_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `exercise_practice_stats_last_rated_idx` ON `exercise_practice_stats` (`last_rated_at`);