package com.helpdesk.service;

import com.helpdesk.dto.NotificationDto;
import com.helpdesk.entity.Notification;
import com.helpdesk.entity.NotificationType;
import com.helpdesk.entity.User;
import com.helpdesk.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private EmailService emailService;

    @Transactional
    public NotificationDto createNotification(User recipient, String title, String message, NotificationType type, Long referenceId) {
        Notification notification = new Notification(recipient, title, message, type, referenceId);
        Notification saved = notificationRepository.save(notification);

        NotificationDto dto = toDto(saved);

        // Broadcast via WebSocket
        if (messagingTemplate != null) {
            try {
                messagingTemplate.convertAndSend("/topic/notifications/" + recipient.getId(), dto);
            } catch (Exception e) {
                logger.debug("WebSocket broadcast skipped: {}", e.getMessage());
            }
        }

        // Dispatch Email if user has enabled email notifications
        if (recipient.isNotificationEmailEnabled() && recipient.getEmail() != null) {
            String emailSubject = "[TechDesk] " + title;
            String emailBody = String.format("Hello %s,\n\n%s\n\nReference ID: %s\n\nAccess the portal to view complete details.\n- TechDesk Enterprise ITSM",
                    recipient.getFullName(), message, referenceId != null ? referenceId : "N/A");
            emailService.sendEmail(recipient.getEmail(), emailSubject, emailBody);
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getNotificationsForUser(Long userId, boolean unreadOnly) {
        List<Notification> list;
        if (unreadOnly) {
            list = notificationRepository.findByUser_IdAndReadFalseOrderByCreatedAtDesc(userId);
        } else {
            list = notificationRepository.findByUser_IdOrderByCreatedAtDesc(userId);
        }
        return list.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUser_IdAndReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUser().getId().equals(userId)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    public NotificationDto toDto(Notification n) {
        return new NotificationDto(
                n.getId(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.getReferenceId(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}
