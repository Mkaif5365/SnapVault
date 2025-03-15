-- Create users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` TEXT PRIMARY KEY,
  `email` TEXT NOT NULL UNIQUE,
  `password_hash` TEXT NOT NULL,
  `name` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key to events table
ALTER TABLE `events` ADD COLUMN `host_id` TEXT REFERENCES `users`(`id`); 