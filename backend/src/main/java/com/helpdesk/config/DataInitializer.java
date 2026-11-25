package com.helpdesk.config;

import com.helpdesk.entity.*;
import com.helpdesk.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TicketCommentRepository commentRepository;

    @Autowired
    private TicketAssignmentRepository assignmentRepository;

    @Autowired
    private TicketHistoryRepository historyRepository;

    @Autowired
    private SlaRuleRepository slaRuleRepository;

    @Autowired
    private KbArticleRepository kbArticleRepository;

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        logger.info("Initializing Helpdesk system seed data...");

        // 1. Initialize Roles
        Role adminRole = initRole(RoleName.ROLE_ADMIN);
        Role agentRole = initRole(RoleName.ROLE_AGENT);
        Role employeeRole = initRole(RoleName.ROLE_EMPLOYEE);

        // 2. Initialize Categories
        Category catHardware = initCategory("Hardware", "Laptops, monitors, docking stations, keyboards, and office peripherals");
        Category catSoftware = initCategory("Software & Applications", "OS issues, developer tooling, Microsoft 365, licensed software");
        Category catNetwork = initCategory("Network & VPN", "Corporate Wi-Fi, VPN connectivity, remote access, DNS and speed issues");
        Category catAccess = initCategory("Access & Identity", "Active Directory login, Okta SSO, password/MFA resets, access requests");
        Category catSecurity = initCategory("Security & Compliance", "Phishing alerts, antivirus notifications, device compliance checks");
        Category catCloud = initCategory("Cloud & Infrastructure", "AWS/Azure staging access, Docker environments, internal test servers");

        // 3. Initialize SLA Rules
        initSlaRule(TicketPriority.CRITICAL, 1, 4, "admin@company.com");
        initSlaRule(TicketPriority.HIGH, 4, 12, "admin@company.com");
        initSlaRule(TicketPriority.MEDIUM, 8, 48, null);
        initSlaRule(TicketPriority.LOW, 24, 96, null);

        // 4. Initialize Users
        User admin = initUser("admin", "admin@company.com", "Alex Mercer", "IT Operations", "+1-555-0101", adminRole);
        User agentSarah = initUser("agent.sarah", "sarah.jenkins@company.com", "Sarah Jenkins", "IT Support Tier 2", "+1-555-0102", agentRole);
        User agentMarcus = initUser("agent.marcus", "marcus.chen@company.com", "Marcus Chen", "Network & Infrastructure", "+1-555-0103", agentRole);
        User empDavid = initUser("emp.david", "david.miller@company.com", "David Miller", "Finance & Accounting", "+1-555-0104", employeeRole);
        User empElena = initUser("emp.elena", "elena.rodriguez@company.com", "Elena Rodriguez", "Product & Design", "+1-555-0105", employeeRole);
        User empPriya = initUser("emp.priya", "priya.sharma@company.com", "Priya Sharma", "Human Resources", "+1-555-0106", employeeRole);

        // 5. Initialize Realistic Enterprise Tickets if none exist
        if (ticketRepository.count() == 0) {
            logger.info("Seeding realistic sample tickets, activity logs, and comments...");

            // Ticket 1: In Progress
            Ticket t1 = createTicket(
                    "HD-1001",
                    "MacBook Pro M2 battery draining rapidly and overheating during video calls",
                    "Laptop battery drops from 100% to 15% in less than 90 minutes when running Zoom or Teams calls with external display connected via Thunderbolt dock. Fan noise is unusually high.",
                    TicketPriority.HIGH,
                    TicketStatus.IN_PROGRESS,
                    catHardware,
                    empDavid,
                    agentSarah,
                    null,
                    LocalDateTime.now().minusDays(2)
            );
            recordAssignment(t1, admin, agentSarah, "Assigned to Tier 2 Hardware support for diagnostics.");
            recordComment(t1, agentSarah, "Ran remote diagnostic logs. Kernel task is throttling CPU due to heat dissipation issue on dock port. Please drop off the laptop at IT Bar or try standalone charger.", false, LocalDateTime.now().minusHours(28));
            recordComment(t1, empDavid, "I've switched to the standalone 96W brick and temperature improved noticeably, but still losing charge on Zoom. Will drop by at 2 PM.", false, LocalDateTime.now().minusHours(24));
            recordComment(t1, agentSarah, "Internal note: Battery health cycle count is at 84%. Might need to order Apple authorized top-case replacement.", true, LocalDateTime.now().minusHours(20));

            // Ticket 2: Assigned
            Ticket t2 = createTicket(
                    "HD-1002",
                    "GlobalProtect VPN connection drops repeatedly when roaming Wi-Fi",
                    "Whenever moving from Building 3 floor 2 to floor 4, the VPN tunnel fails to re-establish and hangs on 'Connecting'. Only a full system reboot temporarily recovers it.",
                    TicketPriority.MEDIUM,
                    TicketStatus.ASSIGNED,
                    catNetwork,
                    empElena,
                    agentMarcus,
                    null,
                    LocalDateTime.now().minusDays(1)
            );
            recordAssignment(t2, admin, agentMarcus, "Marcus, please check Gateway routing and MTU config.");
            recordComment(t2, agentMarcus, "Investigating Wi-Fi roaming handoff logs on Aruba controller for Building 3 APs.", false, LocalDateTime.now().minusHours(10));

            // Ticket 3: Open / Critical
            Ticket t3 = createTicket(
                    "HD-1003",
                    "Urgent: Staging AWS ElasticSearch cluster latency exceeding 3500ms",
                    "Staging search queries are timing out for the mobile app beta build. Cluster state shows yellow status with 2 unassigned replica shards. Blocking QA sign-off for sprint release.",
                    TicketPriority.CRITICAL,
                    TicketStatus.OPEN,
                    catCloud,
                    empElena,
                    null,
                    null,
                    LocalDateTime.now().minusHours(4)
            );

            // Ticket 4: Resolved
            Ticket t4 = createTicket(
                    "HD-1004",
                    "Unable to authenticate to Okta Single Sign-On after quarterly password rotation",
                    "Password was changed yesterday following compliance prompt. Since this morning, Slack and Workday reject authentication with error '401 - Identity Provider Mismatch'.",
                    TicketPriority.HIGH,
                    TicketStatus.RESOLVED,
                    catAccess,
                    empPriya,
                    agentSarah,
                    "Cleared cached OAuth2 tokens in Okta tenant, resynchronized Active Directory SAML assertions, and assisted user with MFA push prompt re-registration.",
                    LocalDateTime.now().minusDays(3)
            );
            t4.setResolvedAt(LocalDateTime.now().minusHours(12));
            ticketRepository.save(t4);
            recordAssignment(t4, admin, agentSarah, "Assigned for immediate identity remediation.");
            recordComment(t4, agentSarah, "AD sync latency caused token discrepancy. Cache purged and tested successfully with user on Google Meet.", false, LocalDateTime.now().minusHours(12));

            // Ticket 5: Closed
            Ticket t5 = createTicket(
                    "HD-1005",
                    "Docker Desktop license expiration warning prompt on developer workstation",
                    "Workstation displays 'Commercial use requires a Docker Desktop subscription' popup after latest update.",
                    TicketPriority.LOW,
                    TicketStatus.CLOSED,
                    catSoftware,
                    empDavid,
                    agentMarcus,
                    "Assigned company Enterprise license key through Jamf Pro profile management.",
                    LocalDateTime.now().minusDays(5)
            );
            t5.setResolvedAt(LocalDateTime.now().minusDays(3));
            ticketRepository.save(t5);
            recordAssignment(t5, admin, agentMarcus, "Standard developer license push.");
            recordComment(t5, agentMarcus, "Enterprise license profile pushed via Jamf. Confirmed valid until end of fiscal year.", false, LocalDateTime.now().minusDays(3));

            // Ticket 6: Resolved / Security
            Ticket t6 = createTicket(
                    "HD-1006",
                    "Suspicious email received with spoofed executive wire transfer request",
                    "Email received with subject 'URGENT: Revised vendor wire details' purporting to come from CFO. Header analysis indicates external origin bypassing SPF record.",
                    TicketPriority.CRITICAL,
                    TicketStatus.RESOLVED,
                    catSecurity,
                    empPriya,
                    agentMarcus,
                    "Sender domain blocked at Cisco Umbrella DNS level and Microsoft Defender for Office 365. Purged malicious emails from all company mailboxes.",
                    LocalDateTime.now().minusDays(4)
            );
            t6.setResolvedAt(LocalDateTime.now().minusDays(2));
            ticketRepository.save(t6);
            recordAssignment(t6, admin, agentMarcus, "High priority security incident escalation.");
            recordComment(t6, agentMarcus, "Incident response completed. SOC report filed and threat indicators updated in SIEM.", false, LocalDateTime.now().minusDays(2));
        }

        // Backfill SLA fields for tickets that have null resolutionDeadline
        List<Ticket> existing = ticketRepository.findAll();
        for (Ticket t : existing) {
            boolean changed = false;
            if (t.getResolutionDeadline() == null) {
                int respHours = switch (t.getPriority()) {
                    case CRITICAL -> 1;
                    case HIGH -> 4;
                    case MEDIUM -> 8;
                    case LOW -> 24;
                };
                int resHours = switch (t.getPriority()) {
                    case CRITICAL -> 4;
                    case HIGH -> 12;
                    case MEDIUM -> 48;
                    case LOW -> 96;
                };
                LocalDateTime created = t.getCreatedAt() != null ? t.getCreatedAt() : LocalDateTime.now();
                t.setResponseDeadline(created.plusHours(respHours));
                t.setResolutionDeadline(created.plusHours(resHours));
                t.setSlaStatus(SlaStatus.WITHIN_SLA);
                changed = true;
            }
            if (t.getSlaStatus() == null) {
                t.setSlaStatus(SlaStatus.WITHIN_SLA);
                changed = true;
            }
            if (changed) {
                ticketRepository.save(t);
            }
        }

        // 6. Initialize Knowledge Base Articles if empty
        if (kbArticleRepository.count() == 0) {
            logger.info("Seeding enterprise Knowledge Base articles...");

            initKbArticle(
                    "Self-Service Password and Okta MFA Reset Guide",
                    "## Self-Service Password Reset\n\n1. Visit **https://sso.company.com** and click **Need help signing in?**\n2. Select **Reset Password**.\n3. Enter your corporate email address (`firstname.lastname@company.com`).\n4. Check your recovery phone for the 6-digit SMS verification code.\n5. Choose a password adhering to policy: **Minimum 14 characters**, including uppercase, lowercase, numbers, and symbols.\n\n## Re-enrolling Okta Verify MFA\n\nIf you have a new mobile device:\n- Open your Okta dashboard on your registered workstation.\n- Navigate to **Settings** > **Extra Verification**.\n- Click **Set up** next to Okta Verify and scan the generated QR code on your new smartphone.\n- If locked out completely, submit an Access & Identity ticket with a contact callback number.",
                    catAccess,
                    admin
            );

            initKbArticle(
                    "Troubleshooting Corporate Wi-Fi and GlobalProtect VPN Disconnections",
                    "## Step 1: Verify 802.1X Corporate Certificate\n- Ensure you are connected to SSID **'Corp-Secure'** rather than 'Guest'.\n- If prompted for credentials, re-enter your domain username (without `@company.com`) and current password.\n\n## Step 2: GlobalProtect VPN Gateway Selection\n- Open GlobalProtect from your system tray.\n- Click the **Gear icon** > **Settings** > **Gateways**.\n- Switch Gateway from **Auto-Detect** to your nearest geographic region (e.g., `us-east-vpn.company.com` or `eu-west-vpn.company.com`).\n\n## Step 3: Flush DNS Cache\n- **Windows**: Open PowerShell as administrator and run `Clear-DnsClientCache` followed by `ipconfig /renew`.\n- **macOS**: In Terminal, run `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`.\n\nIf the issue persists, capture your ping loss rate to `10.0.0.1` and attach the output to your ticket.",
                    catNetwork,
                    agentMarcus
            );

            initKbArticle(
                    "Resolving High CPU Usage and Overheating on MacBook Pro (M-Series)",
                    "## Symptoms\n- Fans spinning at maximum RPM.\n- Battery draining quickly while plugged into a dock.\n- `kernel_task` utilizing > 200% CPU in Activity Monitor.\n\n## Recommended Remediation Steps\n1. **Check Dock Power Delivery**: Ensure your Thunderbolt dock provides at least 85W-100W PD. If using 4K dual displays, plug your official Apple MagSafe / 96W charger directly into the laptop rather than drawing power through the dock.\n2. **Avoid Left-Side USB-C Charging Under Load**: On M-series MacBooks, intense charging through left ports near thermal sensors can trigger `kernel_task` thermal throttling. Plug charging into the right-side port if using USB-C.\n3. **Close Resource Heavy Browser Hardware Acceleration**: In Chrome/Brave Settings > System, verify GPU acceleration does not conflict with displaylink drivers.\n4. **Reset SMC / Power Controller**: Power off, hold Power Button for 10 seconds, and reboot.",
                    catHardware,
                    agentSarah
            );

            initKbArticle(
                    "Developer Environment Setup: Docker Desktop & Proxy Configuration",
                    "## Docker Desktop Enterprise Licensing\nCorporate Docker licenses are managed via Jamf / Intune. If you encounter a license warning:\n1. Quit Docker Desktop.\n2. Ensure you are signed in to Docker Desktop using your SSO domain account.\n\n## Configuring Corporate Proxy Settings\nAdd the following to your `~/.docker/config.json`:\n```json\n{\n  \"proxies\": {\n    \"default\": {\n      \"httpProxy\": \"http://proxy.company.internal:8080\",\n      \"httpsProxy\": \"http://proxy.company.internal:8080\",\n      \"noProxy\": \"localhost,127.0.0.1,.company.internal\"\n    }\n  }\n}\n```\n\nRestart the Docker daemon to apply.",
                    catSoftware,
                    agentMarcus
            );
        }

        // 7. Initialize Announcements if empty
        if (announcementRepository.count() == 0) {
            logger.info("Seeding system announcements...");

            Announcement a1 = new Announcement(
                    "Scheduled Maintenance: Okta SSO & Active Directory Sync",
                    "Our Identity and Access team will be performing quarterly maintenance on the Okta authentication gateway this Saturday between 02:00 AM and 04:00 AM UTC. Intermittent login prompts may occur.",
                    AnnouncementPriority.WARNING,
                    LocalDateTime.now().minusHours(6),
                    LocalDateTime.now().plusDays(4),
                    admin
            );
            announcementRepository.save(a1);

            Announcement a2 = new Announcement(
                    "Security Notice: New Phishing Campaign Targeting Expense Reports",
                    "Information Security has identified emails with spoofed 'Expensify Approval' attachments. Remember that IT and Finance will never ask for your password via email.",
                    AnnouncementPriority.CRITICAL,
                    LocalDateTime.now().minusHours(24),
                    LocalDateTime.now().plusDays(7),
                    admin
            );
            announcementRepository.save(a2);
        }

        logger.info("Helpdesk system seed data initialization complete.");
    }

    private Role initRole(RoleName name) {
        return roleRepository.findByName(name).orElseGet(() -> roleRepository.save(new Role(name)));
    }

    private Category initCategory(String name, String desc) {
        return categoryRepository.findByName(name).orElseGet(() -> categoryRepository.save(new Category(name, desc)));
    }

    private void initSlaRule(TicketPriority priority, int responseHours, int resolutionHours, String escalationEmail) {
        if (!slaRuleRepository.existsByPriority(priority)) {
            SlaRule rule = new SlaRule(priority, responseHours, resolutionHours, escalationEmail);
            slaRuleRepository.save(rule);
        }
    }

    private void initKbArticle(String title, String content, Category category, User author) {
        KbArticle article = new KbArticle(title, content, category, author);
        article.setHelpfulCount(5);
        article.setNotHelpfulCount(0);
        kbArticleRepository.save(article);
    }

    private User initUser(String username, String email, String fullName, String department, String phone, Role role) {
        return userRepository.findByUsername(username).orElseGet(() -> {
            User user = new User(
                    username,
                    email,
                    passwordEncoder.encode("password123"),
                    fullName,
                    department,
                    phone,
                    role
            );
            return userRepository.save(user);
        });
    }

    private Ticket createTicket(String code, String title, String desc, TicketPriority priority, TicketStatus status,
                                Category category, User creator, User assignee, String resolutionNotes, LocalDateTime createdAt) {
        Ticket t = new Ticket();
        t.setTicketCode(code);
        t.setTitle(title);
        t.setDescription(desc);
        t.setPriority(priority);
        t.setStatus(status);
        t.setCategory(category);
        t.setCreatedBy(creator);
        t.setAssignedTo(assignee);
        t.setResolutionNotes(resolutionNotes);
        t.setCreatedAt(createdAt);
        t.setUpdatedAt(LocalDateTime.now());
        t.setSlaStatus(SlaStatus.WITHIN_SLA);
        Ticket saved = ticketRepository.save(t);

        // Audit creation
        TicketHistory h = new TicketHistory(saved, "CREATED", null, status.name(), creator);
        h.setCreatedAt(createdAt);
        historyRepository.save(h);

        return saved;
    }

    private void recordAssignment(Ticket ticket, User assignedBy, User assignedTo, String notes) {
        TicketAssignment assignment = new TicketAssignment(ticket, assignedBy, assignedTo, notes);
        assignmentRepository.save(assignment);

        TicketHistory h = new TicketHistory(ticket, "ASSIGNED", "Unassigned", assignedTo.getFullName(), assignedBy);
        historyRepository.save(h);
    }

    private void recordComment(Ticket ticket, User user, String text, boolean isInternal, LocalDateTime createdAt) {
        TicketComment comment = new TicketComment(ticket, user, text, isInternal);
        comment.setCreatedAt(createdAt);
        commentRepository.save(comment);
    }
}
