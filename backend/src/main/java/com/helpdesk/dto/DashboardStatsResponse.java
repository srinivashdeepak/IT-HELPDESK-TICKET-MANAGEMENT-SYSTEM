package com.helpdesk.dto;

import java.util.HashMap;
import java.util.Map;

public class DashboardStatsResponse {
    private long totalTickets;
    private long openTickets;
    private long assignedTickets;
    private long inProgressTickets;
    private long onHoldTickets;
    private long resolvedTickets;
    private long closedTickets;
    private long criticalTickets;
    private long highTickets;
    private double averageResolutionHours;
    private long myTickets;
    private Map<String, Long> categoryDistribution = new HashMap<>();

    public DashboardStatsResponse() {}

    public long getTotalTickets() {
        return totalTickets;
    }

    public void setTotalTickets(long totalTickets) {
        this.totalTickets = totalTickets;
    }

    public long getOpenTickets() {
        return openTickets;
    }

    public void setOpenTickets(long openTickets) {
        this.openTickets = openTickets;
    }

    public long getAssignedTickets() {
        return assignedTickets;
    }

    public void setAssignedTickets(long assignedTickets) {
        this.assignedTickets = assignedTickets;
    }

    public long getInProgressTickets() {
        return inProgressTickets;
    }

    public void setInProgressTickets(long inProgressTickets) {
        this.inProgressTickets = inProgressTickets;
    }

    public long getOnHoldTickets() {
        return onHoldTickets;
    }

    public void setOnHoldTickets(long onHoldTickets) {
        this.onHoldTickets = onHoldTickets;
    }

    public long getResolvedTickets() {
        return resolvedTickets;
    }

    public void setResolvedTickets(long resolvedTickets) {
        this.resolvedTickets = resolvedTickets;
    }

    public long getClosedTickets() {
        return closedTickets;
    }

    public void setClosedTickets(long closedTickets) {
        this.closedTickets = closedTickets;
    }

    public long getCriticalTickets() {
        return criticalTickets;
    }

    public void setCriticalTickets(long criticalTickets) {
        this.criticalTickets = criticalTickets;
    }

    public long getHighTickets() {
        return highTickets;
    }

    public void setHighTickets(long highTickets) {
        this.highTickets = highTickets;
    }

    public double getAverageResolutionHours() {
        return averageResolutionHours;
    }

    public void setAverageResolutionHours(double averageResolutionHours) {
        this.averageResolutionHours = averageResolutionHours;
    }

    public long getMyTickets() {
        return myTickets;
    }

    public void setMyTickets(long myTickets) {
        this.myTickets = myTickets;
    }

    public Map<String, Long> getCategoryDistribution() {
        return categoryDistribution;
    }

    public void setCategoryDistribution(Map<String, Long> categoryDistribution) {
        this.categoryDistribution = categoryDistribution;
    }
}
