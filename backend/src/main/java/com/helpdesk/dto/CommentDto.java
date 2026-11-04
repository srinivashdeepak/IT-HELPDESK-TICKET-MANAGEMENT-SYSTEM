package com.helpdesk.dto;

import java.time.LocalDateTime;

public class CommentDto {
    private Long id;
    private Long ticketId;
    private Long userId;
    private String userName;
    private String userRole;
    private String commentText;
    private boolean internal;
    private LocalDateTime createdAt;

    public CommentDto() {}

    public CommentDto(Long id, Long ticketId, Long userId, String userName, String userRole, String commentText, boolean internal, LocalDateTime createdAt) {
        this.id = id;
        this.ticketId = ticketId;
        this.userId = userId;
        this.userName = userName;
        this.userRole = userRole;
        this.commentText = commentText;
        this.internal = internal;
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

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    public String getCommentText() {
        return commentText;
    }

    public void setCommentText(String commentText) {
        this.commentText = commentText;
    }

    public boolean isInternal() {
        return internal;
    }

    public void setInternal(boolean internal) {
        this.internal = internal;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
