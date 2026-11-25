-- IT Helpdesk Ticket Management System - Advanced Enterprise Edition
-- Schema Upgrade Script (Safe incremental migration)

USE it_helpdesk_db;

-- 1. Alter Users Table to add availability_status, profile_image, and notification_email_enabled
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS availability_status ENUM('AVAILABLE', 'BUSY', 'UNAVAILABLE') DEFAULT 'AVAILABLE' NOT NULL,
ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS notification_email_enabled BOOLEAN DEFAULT TRUE NOT NULL;

-- 2. Alter Tickets Table for SLA Deadlines, Reopening, and First Response
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS response_deadline TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS resolution_deadline TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS first_responded_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS sla_status ENUM('WITHIN_SLA', 'NEAR_DEADLINE', 'BREACHED') DEFAULT 'WITHIN_SLA' NOT NULL,
ADD COLUMN IF NOT EXISTS sla_breached BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS escalated BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS reopened BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS reopened_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS reopening_reason TEXT NULL;

-- 3. Configurable SLA Rules Table
CREATE TABLE IF NOT EXISTS sla_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL UNIQUE,
    response_time_hours INT NOT NULL,
    resolution_time_hours INT NOT NULL,
    escalation_email VARCHAR(100),
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Real-time Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_id BIGINT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user_read (user_id, is_read),
    INDEX idx_notifications_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Knowledge Base Articles Table
CREATE TABLE IF NOT EXISTS kb_articles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    view_count INT DEFAULT 0 NOT NULL,
    helpful_count INT DEFAULT 0 NOT NULL,
    not_helpful_count INT DEFAULT 0 NOT NULL,
    published BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_kb_category FOREIGN KEY (category_id) REFERENCES ticket_categories(id) ON DELETE RESTRICT,
    CONSTRAINT fk_kb_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_kb_category (category_id),
    INDEX idx_kb_published (published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Knowledge Base Feedback Table (Helpful / Not Helpful)
CREATE TABLE IF NOT EXISTS kb_feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    article_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_kb_fb_article FOREIGN KEY (article_id) REFERENCES kb_articles(id) ON DELETE CASCADE,
    CONSTRAINT fk_kb_fb_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_kb_user_article (article_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Ticket Attachments Table
CREATE TABLE IF NOT EXISTS ticket_attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    comment_id BIGINT NULL,
    file_name VARCHAR(255) NOT NULL,
    stored_file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_by_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_att_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    CONSTRAINT fk_att_comment FOREIGN KEY (comment_id) REFERENCES ticket_comments(id) ON DELETE SET NULL,
    CONSTRAINT fk_att_user FOREIGN KEY (uploaded_by_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_att_ticket (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Ticket Satisfaction Feedback & Star Rating Table
CREATE TABLE IF NOT EXISTS ticket_feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    rating INT NOT NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_feedback_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. System Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    priority ENUM('INFO', 'WARNING', 'CRITICAL') DEFAULT 'INFO' NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_by_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_announcements_user FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_announcements_dates (start_date, end_date, active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Global Audit Logs Table (Admin Security & Operations Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    user_id BIGINT NOT NULL,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_audit_action (action),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
