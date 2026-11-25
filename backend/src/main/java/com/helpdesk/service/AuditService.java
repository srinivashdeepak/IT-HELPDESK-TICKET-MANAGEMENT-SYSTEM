package com.helpdesk.service;

import com.helpdesk.dto.AuditLogDto;
import com.helpdesk.dto.PageResponse;
import com.helpdesk.entity.AuditLog;
import com.helpdesk.entity.User;
import com.helpdesk.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired(required = false)
    private HttpServletRequest currentRequest;

    @Transactional
    public void logAction(String action, String details, User user) {
        String ip = null;
        if (currentRequest != null) {
            try {
                ip = currentRequest.getRemoteAddr();
            } catch (Exception ignored) {}
        }
        AuditLog log = new AuditLog(action, details, user, ip);
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLogDto> getAllLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .limit(100)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogDto> getLogsPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLog> logPage = auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);

        List<AuditLogDto> dtos = logPage.getContent().stream().map(this::toDto).collect(Collectors.toList());

        return new PageResponse<>(
                dtos,
                logPage.getNumber(),
                logPage.getSize(),
                logPage.getTotalElements(),
                logPage.getTotalPages(),
                logPage.isLast()
        );
    }

    public AuditLogDto toDto(AuditLog log) {
        return new AuditLogDto(
                log.getId(),
                log.getAction(),
                log.getDetails(),
                log.getUser().getId(),
                log.getUser().getFullName(),
                log.getUser().getRole().getName().name(),
                log.getIpAddress(),
                log.getCreatedAt()
        );
    }
}
