package com.helpdesk.dto;

import com.helpdesk.entity.TicketPriority;
import com.helpdesk.entity.TicketStatus;

public class TicketUpdateRequest {
    private String title;
    private String description;
    private Long categoryId;
    private TicketPriority priority;
    private TicketStatus status;

    public TicketUpdateRequest() {}

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public TicketPriority getPriority() {
        return priority;
    }

    public void setPriority(TicketPriority priority) {
        this.priority = priority;
    }

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }
}
