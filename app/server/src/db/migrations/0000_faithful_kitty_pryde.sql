CREATE TABLE `shops` (
	`id` varchar(36) NOT NULL,
	`domain` varchar(255) NOT NULL,
	`access_token` text NOT NULL,
	`scope` varchar(500) NOT NULL,
	`email` varchar(255),
	`shop_name` varchar(255),
	`is_active` varchar(5) NOT NULL DEFAULT 'true',
	`installed_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shops_id` PRIMARY KEY(`id`),
	CONSTRAINT `shops_domain_unique` UNIQUE(`domain`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(36) NOT NULL,
	`shop_id` varchar(36) NOT NULL,
	`access_token` text NOT NULL,
	`refresh_token` text NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rules` (
	`id` varchar(36) NOT NULL,
	`shop_id` varchar(36) NOT NULL,
	`product_title` varchar(255) NOT NULL,
	`product_handle` varchar(255),
	`shopify_product_id` varchar(100),
	`status` enum('open','closed','in_production','quality_check','shipping','fulfilled','cancelled') NOT NULL DEFAULT 'open',
	`target_ship_date` timestamp NOT NULL,
	`current_stage` varchar(100) NOT NULL DEFAULT 'Funding',
	`customer_count` int NOT NULL DEFAULT 0,
	`funding_goal` int NOT NULL DEFAULT 0,
	`current_funding` int NOT NULL DEFAULT 0,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(36) NOT NULL,
	`rule_id` varchar(36) NOT NULL,
	`stage_name` varchar(100) NOT NULL,
	`order_index` int NOT NULL,
	`expected_date` timestamp NOT NULL,
	`actual_date` timestamp,
	`status` enum('pending','in_progress','completed','delayed') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scores` (
	`id` varchar(36) NOT NULL,
	`rule_id` varchar(36) NOT NULL,
	`urgency_score` int NOT NULL DEFAULT 0,
	`days_until_ship` int NOT NULL DEFAULT 0,
	`delay_days` int NOT NULL DEFAULT 0,
	`customer_count` int NOT NULL DEFAULT 0,
	`message` text,
	`reported_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `activity_logs` (
	`id` varchar(36) NOT NULL,
	`shop_id` varchar(36) NOT NULL,
	`group_buy_id` varchar(36),
	`action_type` enum('group_buy_created','group_buy_updated','group_buy_cancelled','stage_updated','supplier_update_added','alert_fired','score_recalculated','shop_installed','shop_uninstalled') NOT NULL,
	`description` text NOT NULL,
	`metadata` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_shop_id_shops_id_fk` FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rules` ADD CONSTRAINT `rules_shop_id_shops_id_fk` FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_rule_id_rules_id_fk` FOREIGN KEY (`rule_id`) REFERENCES `rules`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scores` ADD CONSTRAINT `scores_rule_id_rules_id_fk` FOREIGN KEY (`rule_id`) REFERENCES `rules`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_shop_id_shops_id_fk` FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`) ON DELETE cascade ON UPDATE no action;