package com.helpdesk.service;

import com.helpdesk.dto.AuthRequest;
import com.helpdesk.dto.AuthResponse;
import com.helpdesk.dto.RegisterRequest;
import com.helpdesk.entity.Role;
import com.helpdesk.entity.RoleName;
import com.helpdesk.entity.User;
import com.helpdesk.exception.BadRequestException;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.repository.RoleRepository;
import com.helpdesk.repository.UserRepository;
import com.helpdesk.security.JwtUtils;
import com.helpdesk.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Transactional
    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(item -> item.getAuthority())
                .orElse("ROLE_EMPLOYEE");

        return new AuthResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getFullName(),
                role,
                userDetails.getDepartment()
        );
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username '" + request.getUsername() + "' is already taken");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email '" + request.getEmail() + "' is already in use");
        }

        Role employeeRole = roleRepository.findByName(RoleName.ROLE_EMPLOYEE)
                .orElseThrow(() -> new ResourceNotFoundException("Role ROLE_EMPLOYEE not found"));

        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                request.getDepartment(),
                request.getPhone(),
                employeeRole
        );

        userRepository.save(user);

        // Auto authenticate and issue JWT
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                RoleName.ROLE_EMPLOYEE.name(),
                user.getDepartment()
        );
    }

    @Transactional(readOnly = true)
    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new BadRequestException("No authenticated user found in security context");
        }

        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }
}
