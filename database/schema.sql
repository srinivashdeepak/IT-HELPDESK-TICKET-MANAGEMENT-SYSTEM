-- IT Helpdesk Ticket Management System
-- Database Schema (MySQL 8.0+)
-- Author: Senior Java Full Stack Developer

CREATE DATABASE IF NOT EXISTS it_helpdesk_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE it_helpdesk_db;

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    role_id BIGINT NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Ticket Categories Table
CREATE TABLE IF NOT EXISTS ticket_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_code VARCHAR(30) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM' NOT NULL,
    status ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED') DEFAULT 'OPEN' NOT NULL,
    category_id BIGINT NOT NULL,
    created_by_id BIGINT NOT NULL,
    assigned_to_id BIGINT NULL,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP NULL,
    CONSTRAINT fk_tickets_category FOREIGN KEY (category_id) REFERENCES ticket_categories(id) ON DELETE RESTRICT,
    CONSTRAINT fk_tickets_creator FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_tickets_assignee FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_tickets_status (status),
    INDEX idx_tickets_priority (priority),
    INDEX idx_tickets_category (category_id),
    INDEX idx_tickets_creator (created_by_id),
    INDEX idx_tickets_assignee (assigned_to_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Ticket Comments Table
CREATE TABLE IF NOT EXISTS ticket_comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    comment_text TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_comments_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_comments_ticket (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Ticket Assignments Table
CREATE TABLE IF NOT EXISTS ticket_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    assigned_by_id BIGINT NOT NULL,
    assigned_to_id BIGINT NOT NULL,
    notes VARCHAR(255),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_assignments_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignments_by FOREIGN KEY (assigned_by_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_assignments_to FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_assignments_ticket (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Ticket History Table (Activity Audit Log)
CREATE TABLE IF NOT EXISTS ticket_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    action VARCHAR(100) NOT NULL,
    previous_state VARCHAR(255),
    new_state VARCHAR(255),
    changed_by_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_history_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    CONSTRAINT fk_history_user FOREIGN KEY (changed_by_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_history_ticket (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
