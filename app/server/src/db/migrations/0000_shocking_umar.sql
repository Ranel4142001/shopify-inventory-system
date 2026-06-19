CREATE TABLE `shops` (
	`public_id` binary(16) NOT NULL,
	`domain` varchar(255) NOT NULL,
	`access_token` varchar(512),
	`scope` varchar(500),
	`email` varchar(255),
	`shop_name` varchar(255),
	`is_active` boolean NOT NULL DEFAULT true,
	`installed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `shops_public_id` PRIMARY KEY(`public_id`),
	CONSTRAINT `idx_shops_domain` UNIQUE(`domain`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`public_id` binary(16) NOT NULL,
	`shop_public_id` binary(16) NOT NULL,
	`access_token` varchar(512) NOT NULL,
	`refresh_token` varchar(512) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_public_id` PRIMARY KEY(`public_id`),
	CONSTRAINT `idx_sessions_shop_public_id` UNIQUE(`shop_public_id`)
);
--> statement-breakpoint
CREATE TABLE `rules` (
	`public_id` binary(16) NOT NULL,
	`shop_public_id` binary(16) NOT NULL,
	`product_title` varchar(255) NOT NULL,
	`product_handle` varchar(255),
	`shopify_product_id` varchar(64),
	`status` enum('open','closed','in_production','quality_check','shipping','fulfilled','cancelled') NOT NULL DEFAULT 'open',
	`target_ship_date` date NOT NULL,
	`current_stage` varchar(100) NOT NULL DEFAULT 'Funding',
	`customer_count` mediumint NOT NULL DEFAULT 0,
	`funding_goal` int NOT NULL DEFAULT 0,
	`current_funding` int NOT NULL DEFAULT 0,
	`urgency_score` tinyint NOT NULL DEFAULT 0,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `rules_public_id` PRIMARY KEY(`public_id`),
	CONSTRAINT `ux_rules_shop_product` UNIQUE(`shop_public_id`,`shopify_product_id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`public_id` binary(16) NOT NULL,
	`rule_public_id` binary(16) NOT NULL,
	`stage_name` varchar(100) NOT NULL,
	`order_index` smallint NOT NULL,
	`expected_date` date NOT NULL,
	`actual_date` date,
	`status` enum('pending','in_progress','completed','delayed') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `products_public_id` PRIMARY KEY(`public_id`),
	CONSTRAINT `ux_products_rule_order` UNIQUE(`rule_public_id`,`order_index`)
);
--> statement-breakpoint
CREATE TABLE `scores` (
	`public_id` binary(16) NOT NULL,
	`rule_public_id` binary(16) NOT NULL,
	`urgency_score` tinyint NOT NULL DEFAULT 0,
	`days_until_ship` smallint NOT NULL DEFAULT 0,
	`delay_days` smallint NOT NULL DEFAULT 0,
	`customer_count` mediumint NOT NULL DEFAULT 0,
	`message` text,
	`reported_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `scores_public_id` PRIMARY KEY(`public_id`),
	CONSTRAINT `ux_scores_rule_reported` UNIQUE(`rule_public_id`,`reported_at`)
);
--> statement-breakpoint
CREATE TABLE `activity_logs` (
	`public_id` binary(16) NOT NULL,
	`shop_public_id` binary(16) NOT NULL,
	`group_buy_public_id` binary(16),
	`action_type` enum('group_buy_created','group_buy_updated','group_buy_cancelled','stage_updated','supplier_update_added','alert_fired','score_recalculated','shop_installed','shop_uninstalled') NOT NULL,
	`description` text NOT NULL,
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_logs_public_id` PRIMARY KEY(`public_id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`public_id` binary(16) NOT NULL,
	`shop_public_id` binary(16) NOT NULL,
	`rule_public_id` binary(16) NOT NULL,
	`quantity` int NOT NULL,
	`order_reference` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `orders_public_id` PRIMARY KEY(`public_id`)
);
--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_shop_public_id_shops_public_id_fk` FOREIGN KEY (`shop_public_id`) REFERENCES `shops`(`public_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rules` ADD CONSTRAINT `rules_shop_public_id_shops_public_id_fk` FOREIGN KEY (`shop_public_id`) REFERENCES `shops`(`public_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_rule_public_id_rules_public_id_fk` FOREIGN KEY (`rule_public_id`) REFERENCES `rules`(`public_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scores` ADD CONSTRAINT `scores_rule_public_id_rules_public_id_fk` FOREIGN KEY (`rule_public_id`) REFERENCES `rules`(`public_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_shop_public_id_shops_public_id_fk` FOREIGN KEY (`shop_public_id`) REFERENCES `shops`(`public_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_group_buy_public_id_rules_public_id_fk` FOREIGN KEY (`group_buy_public_id`) REFERENCES `rules`(`public_id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_shop_public_id_shops_public_id_fk` FOREIGN KEY (`shop_public_id`) REFERENCES `shops`(`public_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_rule_public_id_rules_public_id_fk` FOREIGN KEY (`rule_public_id`) REFERENCES `rules`(`public_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_shops_is_active` ON `shops` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_sessions_expires_at` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE INDEX `idx_rules_shop_public_id` ON `rules` (`shop_public_id`);--> statement-breakpoint
CREATE INDEX `idx_rules_status` ON `rules` (`status`);--> statement-breakpoint
CREATE INDEX `idx_rules_shop_urgency` ON `rules` (`shop_public_id`,`urgency_score`);--> statement-breakpoint
CREATE INDEX `idx_products_rule_public_id` ON `products` (`rule_public_id`);--> statement-breakpoint
CREATE INDEX `idx_products_status` ON `products` (`status`);--> statement-breakpoint
CREATE INDEX `idx_scores_rule_public_id` ON `scores` (`rule_public_id`);--> statement-breakpoint
CREATE INDEX `idx_scores_rule_reported_at` ON `scores` (`rule_public_id`,`reported_at`);--> statement-breakpoint
CREATE INDEX `idx_activity_logs_shop_public_id` ON `activity_logs` (`shop_public_id`);--> statement-breakpoint
CREATE INDEX `idx_activity_logs_group_buy_public_id` ON `activity_logs` (`group_buy_public_id`);--> statement-breakpoint
CREATE INDEX `idx_activity_logs_created_at` ON `activity_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_activity_logs_shop_created_at` ON `activity_logs` (`shop_public_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_orders_rule_public_id` ON `orders` (`rule_public_id`);--> statement-breakpoint
CREATE INDEX `idx_orders_shop_public_id` ON `orders` (`shop_public_id`);