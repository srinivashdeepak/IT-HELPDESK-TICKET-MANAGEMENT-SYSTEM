package com.helpdesk.service;

import com.helpdesk.dto.DashboardStatsResponse;
import com.helpdesk.entity.*;
import com.helpdesk.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class AnalyticsService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private AuthService authService;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        long total = ticketRepository.count();
        stats.setTotalTickets(total);
        stats.setOpenTickets(ticketRepository.countByStatus(TicketStatus.OPEN));
        stats.setAssignedTickets(ticketRepository.countByStatus(TicketStatus.ASSIGNED));
        stats.setInProgressTickets(ticketRepository.countByStatus(TicketStatus.IN_PROGRESS));
        stats.setOnHoldTickets(ticketRepository.countByStatus(TicketStatus.ON_HOLD));
        stats.setResolvedTickets(ticketRepository.countByStatus(TicketStatus.RESOLVED));
        stats.setClosedTickets(ticketRepository.countByStatus(TicketStatus.CLOSED));

        stats.setCriticalTickets(ticketRepository.countByPriority(TicketPriority.CRITICAL));
        stats.setHighTickets(ticketRepository.countByPriority(TicketPriority.HIGH));

        List<Ticket> allTickets = ticketRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        long resolvedCount = 0;
        double totalResolutionHours = 0.0;
        long responseCount = 0;
        double totalResponseHours = 0.0;
        long overdueCount = 0;
        long breachedCount = 0;

        Map<String, Long> categoryCount = new HashMap<>();
        Map<String, Long> priorityCount = new HashMap<>();
        Map<String, Long> monthlyCount = new LinkedHashMap<>();

        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy");

        for (Ticket t : allTickets) {
            // Category distribution
            if (t.getCategory() != null) {
                String catName = t.getCategory().getName();
                categoryCount.put(catName, categoryCount.getOrDefault(catName, 0L) + 1);
            }

            // Priority distribution
            if (t.getPriority() != null) {
                String prioName = t.getPriority().name();
                priorityCount.put(prioName, priorityCount.getOrDefault(prioName, 0L) + 1);
            }

            // Monthly trend
            if (t.getCreatedAt() != null) {
                String monthKey = t.getCreatedAt().format(monthFormatter);
                monthlyCount.put(monthKey, monthlyCount.getOrDefault(monthKey, 0L) + 1);
            }

            // Resolution time
            if (t.getResolvedAt() != null && t.getCreatedAt() != null) {
                long minutes = Math.abs(Duration.between(t.getCreatedAt(), t.getResolvedAt()).toMinutes());
                if (minutes > 0) {
                    totalResolutionHours += (minutes / 60.0);
                    resolvedCount++;
                }
            }

            // First response time
            if (t.getFirstRespondedAt() != null && t.getCreatedAt() != null) {
                long minutes = Math.abs(Duration.between(t.getCreatedAt(), t.getFirstRespondedAt()).toMinutes());
                totalResponseHours += (minutes / 60.0);
                responseCount++;
            }

            // Overdue check
            if (t.getStatus() != TicketStatus.RESOLVED && t.getStatus() != TicketStatus.CLOSED) {
                if (t.getResolutionDeadline() != null && now.isAfter(t.getResolutionDeadline())) {
                    overdueCount++;
                }
            }

            if (t.isSlaBreached()) {
                breachedCount++;
            }
        }

        stats.setOverdueTickets(overdueCount);

        if (resolvedCount > 0) {
            stats.setAverageResolutionHours(Math.round((totalResolutionHours / resolvedCount) * 10.0) / 10.0);
        } else {
            stats.setAverageResolutionHours(0.0);
        }

        if (responseCount > 0) {
            stats.setAverageFirstResponseHours(Math.round((totalResponseHours / responseCount) * 10.0) / 10.0);
        } else {
            stats.setAverageFirstResponseHours(0.0);
        }

        // SLA Compliance Rate
        if (total > 0) {
            double compliance = ((double) (total - breachedCount) / total) * 100.0;
            stats.setSlaComplianceRate(Math.round(compliance * 10.0) / 10.0);
        } else {
            stats.setSlaComplianceRate(100.0);
        }

        stats.setCategoryDistribution(categoryCount);
        stats.setPriorityDistribution(priorityCount);
        stats.setMonthlyTrends(monthlyCount);

        // Contextual user ticket count
        try {
            User currentUser = authService.getCurrentAuthenticatedUser();
            if (currentUser.getRole().getName() == RoleName.ROLE_EMPLOYEE) {
                stats.setMyTickets(ticketRepository.countByCreatedBy_Id(currentUser.getId()));
            } else if (currentUser.getRole().getName() == RoleName.ROLE_AGENT) {
                stats.setMyTickets(ticketRepository.countByAssignedTo_Id(currentUser.getId()));
            } else {
                stats.setMyTickets(stats.getTotalTickets());
            }
        } catch (Exception ignored) {}

        return stats;
    }

    @Transactional(readOnly = true)
    public byte[] generateCsvReport() {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8);

        // Header
        writer.println("Ticket Code,Title,Category,Priority,Status,Created By,Assigned To,SLA Status,SLA Breached,Created At,Resolved At");

        List<Ticket> tickets = ticketRepository.findAll();
        for (Ticket t : tickets) {
            String title = t.getTitle().replace("\"", "\"\"");
            String category = t.getCategory() != null ? t.getCategory().getName() : "N/A";
            String creator = t.getCreatedBy() != null ? t.getCreatedBy().getFullName() : "N/A";
            String assignee = t.getAssignedTo() != null ? t.getAssignedTo().getFullName() : "Unassigned";

            writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                    t.getTicketCode(),
                    title,
                    category,
                    t.getPriority(),
                    t.getStatus(),
                    creator,
                    assignee,
                    t.getSlaStatus(),
                    t.isSlaBreached() ? "YES" : "NO",
                    t.getCreatedAt() != null ? t.getCreatedAt().toString() : "",
                    t.getResolvedAt() != null ? t.getResolvedAt().toString() : ""
            );
        }

        writer.flush();
        return out.toByteArray();
    }
}
