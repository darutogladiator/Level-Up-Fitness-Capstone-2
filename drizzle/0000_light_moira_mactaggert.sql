CREATE TABLE `nutrition_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_email` text NOT NULL,
	`entry_date` text NOT NULL,
	`meal` text NOT NULL,
	`calories` integer NOT NULL,
	`protein` integer NOT NULL,
	`carbs` integer NOT NULL,
	`fat` integer NOT NULL,
	`water_glasses` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `nutrition_user_date_idx` ON `nutrition_entries` (`user_email`,`entry_date`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`email` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`goal` text DEFAULT 'Build strength and stay consistent' NOT NULL,
	`experience_level` text DEFAULT 'Intermediate' NOT NULL,
	`equipment` text DEFAULT 'Full gym' NOT NULL,
	`schedule_days` integer DEFAULT 4 NOT NULL,
	`session_minutes` integer DEFAULT 45 NOT NULL,
	`calorie_target` integer DEFAULT 2400 NOT NULL,
	`protein_target` integer DEFAULT 150 NOT NULL,
	`accent` text DEFAULT 'cyan' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `quest_completions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_email` text NOT NULL,
	`quest_id` text NOT NULL,
	`completion_date` text NOT NULL,
	`xp` integer NOT NULL,
	`completed_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quest_user_day_unique` ON `quest_completions` (`user_email`,`quest_id`,`completion_date`);--> statement-breakpoint
CREATE TABLE `recommendations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_email` text NOT NULL,
	`goal` text NOT NULL,
	`request_json` text NOT NULL,
	`plan_json` text NOT NULL,
	`engine` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `recommendations_user_idx` ON `recommendations` (`user_email`,`created_at`);--> statement-breakpoint
CREATE TABLE `workouts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_email` text NOT NULL,
	`workout_date` text NOT NULL,
	`exercise` text NOT NULL,
	`category` text NOT NULL,
	`sets` integer NOT NULL,
	`reps` integer NOT NULL,
	`weight` real NOT NULL,
	`duration_minutes` integer NOT NULL,
	`calories` integer NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `workouts_user_date_idx` ON `workouts` (`user_email`,`workout_date`);--> statement-breakpoint
CREATE TABLE `xp_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_email` text NOT NULL,
	`source_type` text NOT NULL,
	`source_id` text NOT NULL,
	`xp` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `xp_source_unique` ON `xp_events` (`user_email`,`source_type`,`source_id`);--> statement-breakpoint
CREATE INDEX `xp_user_idx` ON `xp_events` (`user_email`);