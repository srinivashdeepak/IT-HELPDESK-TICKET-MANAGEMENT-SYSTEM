package com.helpdesk.dto;

import com.helpdesk.entity.TicketPriority;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class SlaRuleDto {
    private Long id;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    @Min(value = 1, message = "Response time must be at least 1 hour")
    private int responseTimeHours;

    @Min(value = 1, message = "Resolution time must be at least 1 hour")
    private int resolutionTimeHours;

    private String escalationEmail;
    private boolean active = true;

    public SlaRuleDto() {}

    public SlaRuleDto(Long id, TicketPriority priority, int responseTimeHours, int resolutionTimeHours, String escalationEmail, boolean active) {
        this.id = id;
        this.priority = priority;
        this.responseTimeHours = responseTimeHours;
        this.resolutionTimeHours = resolutionTimeHours;
        this.escalationEmail = escalationEmail;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TicketPriority getPriority() {
        return priority;
    }

    public void setPriority(TicketPriority priority) {
        this.priority = priority;
    }

    public int getResponseTimeHours() {
        return responseTimeHours;
    }

    public void setResponseTimeHours(int responseTimeHours) {
        this.responseTimeHours = responseTimeHours;
    }

    public int getResolutionTimeHours() {
        return resolutionTimeHours;
    }

    public void setResolutionTimeHours(int resolutionTimeHours) {
        this.resolutionTimeHours = resolutionTimeHours;
    }

    public String getEscalationEmail() {
        return escalationEmail;
    }

    public void setEscalationEmail(String escalationEmail) {
        this.escalationEmail = escalationEmail;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
