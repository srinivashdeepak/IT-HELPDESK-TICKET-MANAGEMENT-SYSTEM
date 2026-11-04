-- IT Helpdesk Ticket Management System
-- Initial Seed Data (Realistic Corporate Environment)

USE it_helpdesk_db;

-- 1. Insert Roles
INSERT INTO roles (id, name) VALUES 
(1, 'ROLE_ADMIN'),
(2, 'ROLE_AGENT'),
(3, 'ROLE_EMPLOYEE')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Insert Ticket Categories
INSERT INTO ticket_categories (id, name, description, active) VALUES
(1, 'Hardware', 'Laptops, monitors, docking stations, keyboards, and office peripherals', 1),
(2, 'Software & Applications', 'OS issues, developer tooling, Microsoft 365, licensed software', 1),
(3, 'Network & VPN', 'Corporate Wi-Fi, VPN connectivity, remote access, DNS and speed issues', 1),
(4, 'Access & Identity', 'Active Directory login, Okta SSO, password/MFA resets, access requests', 1),
(5, 'Security & Compliance', 'Phishing alerts, antivirus notifications, device compliance checks', 1),
(6, 'Cloud & Infrastructure', 'AWS/Azure staging access, Docker environments, internal test servers', 1)
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- Note: User accounts and initial tickets with comments, assignments, and audit trails
-- are automatically seeded on backend startup via DataInitializer to guarantee 
-- BCrypt password encryption compatibility with Spring Security 6.
