-- Add host columns to events table
ALTER TABLE `events` ADD COLUMN `host_id` text;
ALTER TABLE `events` ADD COLUMN `host_name` text;

-- Add user columns to photos table
ALTER TABLE `photos` ADD COLUMN `user_id` text;
ALTER TABLE `photos` ADD COLUMN `user_name` text; 