package com.helpdesk.dto;

import java.time.LocalDateTime;

public class AuditLogDto {
    private Long id;
    private String action;
    private String details;
    private Long userId;
    private String userName;
    private String userRole;
    private String ipAddress;
    private LocalDateTime createdAt;

    public AuditLogDto() {}

    public AuditLogDto(Long id, String action, String details, Long userId, String userName, String userRole, String ipAddress, LocalDateTime createdAt) {
        this.id = id;
        this.action = action;
        this.details = details;
        this.userId = userId;
        this.userName = userName;
        this.userRole = userRole;
        this.ipAddress = ipAddress;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
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

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
