package com.helpdesk.service;

import com.helpdesk.dto.*;
import com.helpdesk.entity.AgentAvailability;
import com.helpdesk.entity.Role;
import com.helpdesk.entity.RoleName;
import com.helpdesk.entity.User;
import com.helpdesk.exception.BadRequestException;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.exception.UnauthorizedException;
import com.helpdesk.repository.RoleRepository;
import com.helpdesk.repository.TicketFeedbackRepository;
import com.helpdesk.repository.TicketRepository;
import com.helpdesk.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TicketFeedbackRepository feedbackRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditService auditService;

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers(RoleName roleFilter) {
        List<User> users;
        if (roleFilter != null) {
            users = userRepository.findByRole_Name(roleFilter);
        } else {
            users = userRepository.findAll();
        }
        return users.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDto> getActiveAgents() {
        return userRepository.findByRole_NameAndActiveTrue(RoleName.ROLE_AGENT)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AgentWorkloadDto> getAgentWorkloads() {
        List<User> agents = userRepository.findByRole_NameAndActiveTrue(RoleName.ROLE_AGENT);

        List<AgentWorkloadDto> workloads = agents.stream().map(agent -> {
            long activeTickets = ticketRepository.countActiveTicketsForAgent(agent.getId());
            Double avgRating = feedbackRepository.getAverageRatingForAgent(agent.getId());
            double rating = avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 5.0;

            return new AgentWorkloadDto(
                    agent.getId(),
                    agent.getUsername(),
                    agent.getFullName(),
                    agent.getEmail(),
                    agent.getDepartment(),
                    agent.getAvailabilityStatus(),
                    activeTickets,
                    rating,
                    false
            );
        }).collect(Collectors.toList());

        // Sort by availability (AVAILABLE first), then by lowest activeTicketCount
        workloads.sort(Comparator
                .comparing((AgentWorkloadDto a) -> a.getAvailabilityStatus() == AgentAvailability.AVAILABLE ? 0 : 1)
                .thenComparingLong(AgentWorkloadDto::getActiveTicketCount)
        );

        if (!workloads.isEmpty() && workloads.get(0).getAvailabilityStatus() == AgentAvailability.AVAILABLE) {
            workloads.get(0).setRecommended(true);
        }

        return workloads;
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return toDto(user);
    }

    @Transactional
    public UserDto createUser(UserCreateRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username '" + request.getUsername() + "' is already in use");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email '" + request.getEmail() + "' is already in use");
        }

        Role role = roleRepository.findByName(request.getRole())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + request.getRole()));

        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                request.getDepartment(),
                request.getPhone(),
                role
        );

        User savedUser = userRepository.save(user);
        auditService.logAction("USER_PROVISIONED", "Provisioned new account for: " + savedUser.getUsername() + " (" + role.getName() + ")", savedUser);
        return toDto(savedUser);
    }

    @Transactional
    public UserDto updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setFullName(request.getFullName());
        user.setDepartment(request.getDepartment());
        user.setPhone(request.getPhone());
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        return toDto(userRepository.save(user));
    }

    @Transactional
    public UserDto updateProfile(Long userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setFullName(request.getFullName().trim());
        user.setDepartment(request.getDepartment().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone().trim());
        if (request.getNotificationEmailEnabled() != null) {
            user.setNotificationEmailEnabled(request.getNotificationEmailEnabled());
        }

        return toDto(userRepository.save(user));
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditService.logAction("PASSWORD_CHANGED", "User successfully rotated account password", user);
    }

    @Transactional
    public UserDto setAvailability(Long userId, AgentAvailability status, User executingUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        boolean isSelf = user.getId().equals(executingUser.getId());
        boolean isAdmin = executingUser.getRole().getName() == RoleName.ROLE_ADMIN;

        if (!isSelf && !isAdmin) {
            throw new UnauthorizedException("Only the agent or an administrator can modify availability status");
        }

        user.setAvailabilityStatus(status);
        User saved = userRepository.save(user);

        auditService.logAction("AVAILABILITY_CHANGED", "Agent " + user.getUsername() + " status set to " + status + (isSelf ? " (Self)" : " (By Admin)"), executingUser);

        return toDto(saved);
    }

    @Transactional
    public UserDto toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setActive(!user.isActive());
        return toDto(userRepository.save(user));
    }

    public UserDto toDto(User user) {
        UserDto dto = new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getDepartment(),
                user.getPhone(),
                user.getRole().getName().name(),
                user.isActive(),
                user.getCreatedAt()
        );
        dto.setAvailabilityStatus(user.getAvailabilityStatus());
        dto.setNotificationEmailEnabled(user.isNotificationEmailEnabled());
        return dto;
    }
}
