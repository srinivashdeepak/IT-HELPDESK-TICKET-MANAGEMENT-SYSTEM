package com.helpdesk.service;

import com.helpdesk.dto.DashboardStatsResponse;
import com.helpdesk.entity.*;
import com.helpdesk.repository.CategoryRepository;
import com.helpdesk.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private AuthService authService;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        stats.setTotalTickets(ticketRepository.count());
        stats.setOpenTickets(ticketRepository.countByStatus(TicketStatus.OPEN));
        stats.setAssignedTickets(ticketRepository.countByStatus(TicketStatus.ASSIGNED));
        stats.setInProgressTickets(ticketRepository.countByStatus(TicketStatus.IN_PROGRESS));
        stats.setOnHoldTickets(ticketRepository.countByStatus(TicketStatus.ON_HOLD));
        stats.setResolvedTickets(ticketRepository.countByStatus(TicketStatus.RESOLVED));
        stats.setClosedTickets(ticketRepository.countByStatus(TicketStatus.CLOSED));

        stats.setCriticalTickets(ticketRepository.countByPriority(TicketPriority.CRITICAL));
        stats.setHighTickets(ticketRepository.countByPriority(TicketPriority.HIGH));

        // Calculate average resolution time across resolved tickets
        List<Ticket> allTickets = ticketRepository.findAll();
        long resolvedCount = 0;
        double totalHours = 0.0;

        Map<String, Long> categoryCount = new HashMap<>();

        for (Ticket t : allTickets) {
            // Category distribution
            if (t.getCategory() != null) {
                String catName = t.getCategory().getName();
                categoryCount.put(catName, categoryCount.getOrDefault(catName, 0L) + 1);
            }

            // Resolution time
            if (t.getResolvedAt() != null && t.getCreatedAt() != null) {
                long minutes = Math.abs(Duration.between(t.getCreatedAt(), t.getResolvedAt()).toMinutes());
                if (minutes > 0) {
                    totalHours += (minutes / 60.0);
                    resolvedCount++;
                }
            }
        }

        if (resolvedCount > 0) {
            double avg = Math.round((totalHours / resolvedCount) * 10.0) / 10.0;
            stats.setAverageResolutionHours(avg);
        } else {
            stats.setAverageResolutionHours(0.0);
        }

        stats.setCategoryDistribution(categoryCount);

        // Current user contextual count
        try {
            User currentUser = authService.getCurrentAuthenticatedUser();
            if (currentUser.getRole().getName() == RoleName.ROLE_EMPLOYEE) {
                stats.setMyTickets(ticketRepository.countByCreatedBy_Id(currentUser.getId()));
            } else if (currentUser.getRole().getName() == RoleName.ROLE_AGENT) {
                stats.setMyTickets(ticketRepository.countByAssignedTo_Id(currentUser.getId()));
            } else {
                stats.setMyTickets(stats.getTotalTickets());
            }
        } catch (Exception ignored) {
        }

        return stats;
    }
}
