package com.helpdesk.dto;

import com.helpdesk.entity.TicketStatus;
import jakarta.validation.constraints.NotNull;

public class TicketStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private TicketStatus status;

    private String resolutionNotes;

    public TicketStatusUpdateRequest() {}

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }
}
