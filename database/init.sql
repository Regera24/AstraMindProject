-- AstraMind Database Initialization Script
-- This script creates the initial database structure and sample data

-- Set SQL mode and character set
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- Create database if not exists (already handled by docker-compose)
CREATE DATABASE IF NOT EXISTS astramind_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE astramind_db;

-- =====================================================
-- ROLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `Role` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL UNIQUE,
    `description` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `Subscription` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `duration_days` INT NOT NULL DEFAULT 30,
    `max_tasks` INT DEFAULT NULL,
    `max_categories` INT DEFAULT NULL,
    `features` JSON,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ACCOUNTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `Account` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `full_name` VARCHAR(100),
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `gender` BOOLEAN DEFAULT NULL COMMENT 'true=male, false=female, null=not specified',
    `birth_date` DATE DEFAULT NULL,
    `otp` VARCHAR(7) DEFAULT NULL,
    `avatar_url` VARCHAR(500) DEFAULT NULL,
    `phone_number` VARCHAR(20) DEFAULT NULL,
    `RoleID` BIGINT DEFAULT NULL,
    `SubscriptionID` BIGINT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`RoleID`) REFERENCES `Role`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`SubscriptionID`) REFERENCES `Subscription`(`id`) ON DELETE SET NULL,
    INDEX `idx_account_username` (`username`),
    INDEX `idx_account_email` (`email`),
    INDEX `idx_account_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `Category` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `color` VARCHAR(7) DEFAULT '#3B82F6' COMMENT 'Hex color code',
    `icon` VARCHAR(50) DEFAULT NULL,
    `account_id` BIGINT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE,
    INDEX `idx_category_account` (`account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TASKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `Task` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
    `due_date` DATETIME DEFAULT NULL,
    `completed_at` DATETIME DEFAULT NULL,
    `account_id` BIGINT NOT NULL,
    `category_id` BIGINT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE SET NULL,
    INDEX `idx_task_account` (`account_id`),
    INDEX `idx_task_status` (`status`),
    INDEX `idx_task_due_date` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `Notification` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR') DEFAULT 'INFO',
    `is_read` BOOLEAN DEFAULT FALSE,
    `target_account_id` BIGINT NOT NULL,
    `send_account_id` BIGINT DEFAULT NULL,
    `related_task_id` BIGINT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`target_account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`send_account_id`) REFERENCES `Account`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`related_task_id`) REFERENCES `Task`(`id`) ON DELETE SET NULL,
    INDEX `idx_notification_target` (`target_account_id`),
    INDEX `idx_notification_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS `Payment` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `amount` DECIMAL(10,2) NOT NULL,
    `currency` VARCHAR(3) DEFAULT 'USD',
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    `payment_method` VARCHAR(50) DEFAULT NULL,
    `transaction_id` VARCHAR(100) DEFAULT NULL,
    `account_id` BIGINT NOT NULL,
    `subscription_id` BIGINT NOT NULL,
    `paid_at` DATETIME DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`account_id`) REFERENCES `Account`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`subscription_id`) REFERENCES `Subscription`(`id`) ON DELETE CASCADE,
    INDEX `idx_payment_account` (`account_id`),
    INDEX `idx_payment_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INSERT INITIAL DATA
-- =====================================================

-- Insert default roles
INSERT INTO `Role` (`name`, `description`) VALUES
('ADMIN', 'System Administrator with full access'),
('USER', 'Regular user with standard access'),
('PREMIUM_USER', 'Premium user with enhanced features')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- Insert default subscription plans
INSERT INTO `Subscription` (`name`, `description`, `price`, `duration_days`, `max_tasks`, `max_categories`, `features`, `is_active`) VALUES
('FREE', 'Free plan with basic features', 0.00, 365, 50, 5, '["basic_tasks", "basic_categories"]', TRUE),
('PREMIUM', 'Premium plan with advanced features', 9.99, 30, 500, 50, '["unlimited_tasks", "unlimited_categories", "priority_support", "advanced_analytics"]', TRUE),
('ENTERPRISE', 'Enterprise plan for teams', 29.99, 30, NULL, NULL, '["unlimited_everything", "team_collaboration", "api_access", "custom_integrations"]', TRUE)
ON DUPLICATE KEY UPDATE 
    `description` = VALUES(`description`),
    `price` = VALUES(`price`),
    `features` = VALUES(`features`);

-- Insert default admin user (password: admin123 - should be hashed in real application)
INSERT INTO `Account` (`username`, `full_name`, `email`, `password`, `is_active`, `RoleID`, `SubscriptionID`) 
SELECT 'admin', 'System Administrator', 'admin@astramind.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE, r.id, s.id
FROM `Role` r, `Subscription` s 
WHERE r.name = 'ADMIN' AND s.name = 'ENTERPRISE'
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

-- Insert sample user (password: user123 - should be hashed in real application)
INSERT INTO `Account` (`username`, `full_name`, `email`, `password`, `is_active`, `RoleID`, `SubscriptionID`) 
SELECT 'testuser', 'Test User', 'user@astramind.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE, r.id, s.id
FROM `Role` r, `Subscription` s 
WHERE r.name = 'USER' AND s.name = 'FREE'
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

-- Insert sample categories for test user
INSERT INTO `Category` (`name`, `description`, `color`, `account_id`) 
SELECT 'Work', 'Work related tasks', '#EF4444', a.id FROM `Account` a WHERE a.username = 'testuser'
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

INSERT INTO `Category` (`name`, `description`, `color`, `account_id`) 
SELECT 'Personal', 'Personal tasks and activities', '#10B981', a.id FROM `Account` a WHERE a.username = 'testuser'
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

INSERT INTO `Category` (`name`, `description`, `color`, `account_id`) 
SELECT 'Health', 'Health and fitness related', '#8B5CF6', a.id FROM `Account` a WHERE a.username = 'testuser'
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- Insert sample tasks
INSERT INTO `Task` (`title`, `description`, `status`, `priority`, `due_date`, `account_id`, `category_id`) 
SELECT 'Complete project documentation', 'Finish writing the technical documentation for the new feature', 'IN_PROGRESS', 'HIGH', DATE_ADD(NOW(), INTERVAL 3 DAY), a.id, c.id 
FROM `Account` a, `Category` c 
WHERE a.username = 'testuser' AND c.name = 'Work' AND c.account_id = a.id
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

INSERT INTO `Task` (`title`, `description`, `status`, `priority`, `due_date`, `account_id`, `category_id`) 
SELECT 'Weekly grocery shopping', 'Buy groceries for the week', 'PENDING', 'MEDIUM', DATE_ADD(NOW(), INTERVAL 1 DAY), a.id, c.id 
FROM `Account` a, `Category` c 
WHERE a.username = 'testuser' AND c.name = 'Personal' AND c.account_id = a.id
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

INSERT INTO `Task` (`title`, `description`, `status`, `priority`, `account_id`, `category_id`) 
SELECT 'Morning workout', 'Complete 30-minute cardio session', 'COMPLETED', 'MEDIUM', a.id, c.id 
FROM `Account` a, `Category` c 
WHERE a.username = 'testuser' AND c.name = 'Health' AND c.account_id = a.id
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- Insert sample notification
INSERT INTO `Notification` (`title`, `message`, `type`, `target_account_id`, `send_account_id`) 
SELECT 'Welcome to AstraMind!', 'Thank you for joining AstraMind. Start organizing your tasks efficiently!', 'INFO', a.id, admin.id
FROM `Account` a, `Account` admin 
WHERE a.username = 'testuser' AND admin.username = 'admin'
ON DUPLICATE KEY UPDATE `message` = VALUES(`message`);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Additional performance indexes
CREATE INDEX IF NOT EXISTS `idx_task_created_at` ON `Task` (`created_at`);
CREATE INDEX IF NOT EXISTS `idx_task_priority` ON `Task` (`priority`);
CREATE INDEX IF NOT EXISTS `idx_notification_created_at` ON `Notification` (`created_at`);
CREATE INDEX IF NOT EXISTS `idx_account_created_at` ON `Account` (`created_at`);

-- =====================================================
-- COMMIT TRANSACTION
-- =====================================================
COMMIT;

-- Display success message
SELECT 'AstraMind database initialized successfully!' as message;
