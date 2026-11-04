package com.helpdesk.controller;

import com.helpdesk.dto.ApiResponse;
import com.helpdesk.dto.UserCreateRequest;
import com.helpdesk.dto.UserDto;
import com.helpdesk.dto.UserUpdateRequest;
import com.helpdesk.entity.RoleName;
import com.helpdesk.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

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
