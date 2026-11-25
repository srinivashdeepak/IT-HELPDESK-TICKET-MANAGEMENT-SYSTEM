package com.helpdesk.dto;

import java.time.LocalDateTime;

public class TicketFeedbackDto {
    private Long id;
    private Long ticketId;
    private String ticketCode;
    private Long userId;
    private String userName;
    private int rating;
    private String comments;
    private LocalDateTime createdAt;

    public TicketFeedbackDto() {}

    public TicketFeedbackDto(Long id, Long ticketId, String ticketCode, Long userId, String userName, int rating, String comments, LocalDateTime createdAt) {
        this.id = id;
        this.ticketId = ticketId;
        this.ticketCode = ticketCode;
        this.userId = userId;
        this.userName = userName;
        this.rating = rating;
        this.comments = comments;
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

    public String getTicketCode() {
        return ticketCode;
    }

    public void setTicketCode(String ticketCode) {
        this.ticketCode = ticketCode;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
