package com.helpdesk.dto;

import jakarta.validation.constraints.NotNull;

public class TicketAssignRequest {

    @NotNull(message = "Agent ID is required")
    private Long agentId;

    private String notes;

    public TicketAssignRequest() {}

    public Long getAgentId() {
        return agentId;
    }

    public void setAgentId(Long agentId) {
        this.agentId = agentId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
