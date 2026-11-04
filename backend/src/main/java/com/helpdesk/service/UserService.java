package com.helpdesk.service;

import com.helpdesk.dto.UserCreateRequest;
import com.helpdesk.dto.UserDto;
import com.helpdesk.dto.UserUpdateRequest;
import com.helpdesk.entity.Role;
import com.helpdesk.entity.RoleName;
import com.helpdesk.entity.User;
import com.helpdesk.exception.BadRequestException;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.repository.RoleRepository;
import com.helpdesk.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
    public UserDto toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setActive(!user.isActive());
        return toDto(userRepository.save(user));
    }

    public UserDto toDto(User user) {
        return new UserDto(
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
    }
}
