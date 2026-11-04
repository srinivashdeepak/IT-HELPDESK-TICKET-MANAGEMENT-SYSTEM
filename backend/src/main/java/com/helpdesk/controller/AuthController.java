package com.helpdesk.controller;

import com.helpdesk.dto.ApiResponse;
import com.helpdesk.dto.AuthRequest;
import com.helpdesk.dto.AuthResponse;
import com.helpdesk.dto.RegisterRequest;
import com.helpdesk.entity.User;
import com.helpdesk.service.AuthService;
import com.helpdesk.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<?>> getCurrentUser() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(ApiResponse.success(userService.toDto(user)));
    }
}
