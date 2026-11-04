package com.helpdesk.dto;

import java.time.LocalDateTime;

public class HistoryDto {
    private Long id;
    private Long ticketId;
    private String action;
    private String previousState;
    private String newState;
    private Long changedById;
    private String changedByName;
    private LocalDateTime createdAt;

    public HistoryDto() {}

    public HistoryDto(Long id, Long ticketId, String action, String previousState, String newState, Long changedById, String changedByName, LocalDateTime createdAt) {
        this.id = id;
        this.ticketId = ticketId;
        this.action = action;
        this.previousState = previousState;
        this.newState = newState;
        this.changedById = changedById;
        this.changedByName = changedByName;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getPreviousState() {
        return previousState;
    }

    public void setPreviousState(String previousState) {
        this.previousState = previousState;
    }

    public String getNewState() {
        return newState;
    }

    public void setNewState(String newState) {
        this.newState = newState;
    }

    public Long getChangedById() {
        return changedById;
    }

    public void setChangedById(Long changedById) {
        this.changedById = changedById;
    }

    public String getChangedByName() {
        return changedByName;
    }

    public void setChangedByName(String changedByName) {
        this.changedByName = changedByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
