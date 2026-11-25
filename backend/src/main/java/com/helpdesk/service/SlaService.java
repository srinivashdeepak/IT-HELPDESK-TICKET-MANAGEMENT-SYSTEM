package com.helpdesk.service;

import com.helpdesk.dto.SlaRuleDto;
import com.helpdesk.entity.*;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SlaService {

    private static final Logger logger = LoggerFactory.getLogger(SlaService.class);

    @Autowired
    private SlaRuleRepository slaRuleRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private TicketHistoryRepository historyRepository;

    @Autowired
    private AuditService auditService;

    @Transactional
    public void applySlaDeadlines(Ticket ticket) {
        TicketPriority priority = ticket.getPriority() != null ? ticket.getPriority() : TicketPriority.MEDIUM;
        SlaRule rule = slaRuleRepository.findByPriority(priority)
                .orElseGet(() -> getDefaultRule(priority));

        LocalDateTime now = ticket.getCreatedAt() != null ? ticket.getCreatedAt() : LocalDateTime.now();
        ticket.setResponseDeadline(now.plusHours(rule.getResponseTimeHours()));
        ticket.setResolutionDeadline(now.plusHours(rule.getResolutionTimeHours()));
        ticket.setSlaStatus(SlaStatus.WITHIN_SLA);
        ticket.setSlaBreached(false);
    }

    public SlaStatus calculateCurrentSlaStatus(Ticket ticket) {
        if (ticket.getStatus() == TicketStatus.RESOLVED || ticket.getStatus() == TicketStatus.CLOSED) {
            return ticket.isSlaBreached() ? SlaStatus.BREACHED : SlaStatus.WITHIN_SLA;
        }

        if (ticket.getResolutionDeadline() == null) {
            return SlaStatus.WITHIN_SLA;
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(ticket.getResolutionDeadline())) {
            return SlaStatus.BREACHED;
        }

        // Check if within 20% of remaining time
        if (ticket.getCreatedAt() != null) {
            long totalMinutes = Duration.between(ticket.getCreatedAt(), ticket.getResolutionDeadline()).toMinutes();
            long remainingMinutes = Duration.between(now, ticket.getResolutionDeadline()).toMinutes();
            if (totalMinutes > 0 && remainingMinutes <= (totalMinutes * 0.2)) {
                return SlaStatus.NEAR_DEADLINE;
            }
        }

        return SlaStatus.WITHIN_SLA;
    }

    @Scheduled(fixedRateString = "${app.sla.check-rate-ms:60000}")
    @Transactional
    public void checkAndEscalateBreachedTickets() {
        LocalDateTime now = LocalDateTime.now();
        List<Ticket> overdueTickets = ticketRepository.findOverdueTicketsAwaitingBreach(now);

        if (overdueTickets.isEmpty()) {
            return;
        }

        logger.warn("SLA Scanner found {} overdue tickets requiring escalation", overdueTickets.size());

        List<User> admins = userRepository.findByRole_Name(RoleName.ROLE_ADMIN);

        for (Ticket ticket : overdueTickets) {
            ticket.setSlaBreached(true);
            ticket.setSlaStatus(SlaStatus.BREACHED);
            ticket.setEscalated(true);
            ticket.setEscalatedAt(now);
            ticketRepository.save(ticket);

            // Audit history on ticket
            TicketHistory history = new TicketHistory(
                    ticket,
                    "SLA_BREACH_ESCALATED",
                    SlaStatus.WITHIN_SLA.name(),
                    SlaStatus.BREACHED.name(),
                    admins.isEmpty() ? ticket.getCreatedBy() : admins.get(0)
            );
            historyRepository.save(history);

            // Notify all administrators
            for (User admin : admins) {
                notificationService.createNotification(
                        admin,
                        "SLA Breached & Escalated: " + ticket.getTicketCode(),
                        String.format("Ticket '%s' (Priority: %s) has breached its resolution SLA target deadline of %s and has been automatically escalated.",
                                ticket.getTitle(), ticket.getPriority(), ticket.getResolutionDeadline()),
                        NotificationType.SLA_BREACH,
                        ticket.getId()
                );
            }

            // Notify assigned agent if present
            if (ticket.getAssignedTo() != null) {
                notificationService.createNotification(
                        ticket.getAssignedTo(),
                        "Urgent: SLA Breached on " + ticket.getTicketCode(),
                        "The resolution deadline for your assigned ticket '" + ticket.getTitle() + "' has passed.",
                        NotificationType.SLA_BREACH,
                        ticket.getId()
                );
            }

            if (!admins.isEmpty()) {
                auditService.logAction(
                        "TICKET_ESCALATED",
                        "Ticket " + ticket.getTicketCode() + " escalated due to resolution SLA breach",
                        admins.get(0)
                );
            }
        }
    }

    @Transactional(readOnly = true)
    public List<SlaRuleDto> getAllRules() {
        return slaRuleRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public SlaRuleDto updateRule(Long id, SlaRuleDto dto) {
        SlaRule rule = slaRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SLA rule not found: " + id));

        rule.setResponseTimeHours(dto.getResponseTimeHours());
        rule.setResolutionTimeHours(dto.getResolutionTimeHours());
        rule.setEscalationEmail(dto.getEscalationEmail());
        rule.setActive(dto.isActive());

        return toDto(slaRuleRepository.save(rule));
    }

    public SlaRule getDefaultRule(TicketPriority priority) {
        switch (priority) {
            case CRITICAL:
                return new SlaRule(priority, 1, 4, "escalations-critical@company.com");
            case HIGH:
                return new SlaRule(priority, 4, 12, "escalations-high@company.com");
            case MEDIUM:
                return new SlaRule(priority, 8, 48, "helpdesk-lead@company.com");
            case LOW:
            default:
                return new SlaRule(priority, 24, 96, null);
        }
    }

    public SlaRuleDto toDto(SlaRule r) {
        return new SlaRuleDto(
                r.getId(),
                r.getPriority(),
                r.getResponseTimeHours(),
                r.getResolutionTimeHours(),
                r.getEscalationEmail(),
                r.isActive()
        );
    }
}
