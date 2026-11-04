package com.helpdesk.dto;

import jakarta.validation.constraints.NotBlank;

public class UserUpdateRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Department is required")
    private String department;

    private String phone;

    private Boolean active;

    public UserUpdateRequest() {}

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
