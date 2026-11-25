package com.helpdesk.dto;

import com.helpdesk.entity.AgentAvailability;

public class AgentWorkloadDto {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String department;
    private AgentAvailability availabilityStatus;
    private long activeTicketCount;
    private double averageRating;
    private boolean recommended;

    public AgentWorkloadDto() {}

    public AgentWorkloadDto(Long id, String username, String fullName, String email, String department, AgentAvailability availabilityStatus, long activeTicketCount, double averageRating, boolean recommended) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.department = department;
        this.availabilityStatus = availabilityStatus;
        this.activeTicketCount = activeTicketCount;
        this.averageRating = averageRating;
        this.recommended = recommended;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public AgentAvailability getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(AgentAvailability availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }

    public long getActiveTicketCount() {
        return activeTicketCount;
    }

    public void setActiveTicketCount(long activeTicketCount) {
        this.activeTicketCount = activeTicketCount;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }

    public boolean isRecommended() {
        return recommended;
    }

    public void setRecommended(boolean recommended) {
        this.recommended = recommended;
    }
}
