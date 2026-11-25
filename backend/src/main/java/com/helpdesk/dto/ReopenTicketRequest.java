package com.helpdesk.dto;

import jakarta.validation.constraints.NotBlank;

public class ReopenTicketRequest {

    @NotBlank(message = "Reopening reason is required")
    private String reason;

    public ReopenTicketRequest() {}

    public ReopenTicketRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
