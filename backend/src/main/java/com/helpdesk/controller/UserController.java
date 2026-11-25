package com.helpdesk.controller;

import com.helpdesk.dto.*;
import com.helpdesk.entity.AgentAvailability;
import com.helpdesk.entity.RoleName;
import com.helpdesk.entity.User;
import com.helpdesk.service.AuthService;
import com.helpdesk.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthService authService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers(
            @RequestParam(required = false) RoleName role) {
        List<UserDto> users = userService.getAllUsers(role);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/agents")
    public ResponseEntity<ApiResponse<List<UserDto>>> getActiveAgents() {
        List<UserDto> agents = userService.getActiveAgents();
        return ResponseEntity.ok(ApiResponse.success(agents));
    }

    @GetMapping("/workloads")
    public ResponseEntity<ApiResponse<List<AgentWorkloadDto>>> getAgentWorkloads() {
        List<AgentWorkloadDto> workloads = userService.getAgentWorkloads();
        return ResponseEntity.ok(ApiResponse.success(workloads));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        UserDto user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> createUser(@Valid @RequestBody UserCreateRequest request) {
        UserDto created = userService.createUser(request);
        return ResponseEntity.ok(ApiResponse.success("User created successfully", created));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        UserDto updated = userService.updateProfile(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        userService.changePassword(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<UserDto>> updateAvailability(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        AgentAvailability status = AgentAvailability.valueOf(body.get("status"));
        UserDto updated = userService.setAvailability(id, status, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Availability status updated", updated));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request) {
        UserDto updated = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> toggleStatus(@PathVariable Long id) {
        UserDto updated = userService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.success("User status changed successfully", updated));
    }
}
