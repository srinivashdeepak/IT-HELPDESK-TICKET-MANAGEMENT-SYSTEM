package com.helpdesk.service;

import com.helpdesk.dto.AttachmentDto;
import com.helpdesk.entity.*;
import com.helpdesk.exception.BadRequestException;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.exception.UnauthorizedException;
import com.helpdesk.repository.TicketAttachmentRepository;
import com.helpdesk.repository.TicketCommentRepository;
import com.helpdesk.repository.TicketRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AttachmentService {

    private static final Logger logger = LoggerFactory.getLogger(AttachmentService.class);

    @Value("${app.upload.dir:uploads/attachments}")
    private String uploadDir;

    @Autowired
    private TicketAttachmentRepository attachmentRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TicketCommentRepository commentRepository;

    @Autowired
    private AuthService authService;

    private static final Set<String> ALLOWED_EXTENSIONS = new HashSet<>(Arrays.asList(
            "png", "jpg", "jpeg", "gif", "pdf", "txt", "log", "doc", "docx", "xls", "xlsx", "zip"
    ));

    @PostConstruct
    public void init() {
        try {
            Path path = Paths.get(uploadDir);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
                logger.info("Upload directory initialized at: {}", path.toAbsolutePath());
            }
        } catch (IOException e) {
            logger.error("Could not create upload directory: {}", e.getMessage());
        }
    }

    @Transactional
    public AttachmentDto uploadAttachment(Long ticketId, Long commentId, MultipartFile file) {
        User currentUser = authService.getCurrentAuthenticatedUser();

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        if (currentUser.getRole().getName() == RoleName.ROLE_EMPLOYEE && !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to upload attachments to this ticket");
        }

        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded file cannot be empty");
        }

        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        if (originalFilename.contains("..")) {
            throw new BadRequestException("Invalid path sequence in filename");
        }

        // Validate extension
        String extension = "";
        int i = originalFilename.lastIndexOf('.');
        if (i > 0) {
            extension = originalFilename.substring(i + 1).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("File type '." + extension + "' is not permitted. Allowed: " + ALLOWED_EXTENSIONS);
        }

        // Max 15MB
        if (file.getSize() > 15 * 1024 * 1024) {
            throw new BadRequestException("File size exceeds 15MB limit");
        }

        String storedFileName = UUID.randomUUID().toString() + "_" + originalFilename;

        try {
            Path targetLocation = Paths.get(uploadDir).resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            TicketComment comment = null;
            if (commentId != null) {
                comment = commentRepository.findById(commentId).orElse(null);
            }

            TicketAttachment attachment = new TicketAttachment(
                    ticket,
                    comment,
                    originalFilename,
                    storedFileName,
                    file.getContentType() != null ? file.getContentType() : "application/octet-stream",
                    file.getSize(),
                    currentUser
            );

            TicketAttachment saved = attachmentRepository.save(attachment);
            return toDto(saved);
        } catch (IOException e) {
            logger.error("Failed to store file {}: {}", originalFilename, e.getMessage());
            throw new BadRequestException("Could not store file. Please try again.");
        }
    }

    @Transactional(readOnly = true)
    public List<AttachmentDto> getTicketAttachments(Long ticketId) {
        return attachmentRepository.findByTicket_IdOrderByCreatedAtDesc(ticketId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Resource loadFileAsResource(Long attachmentId) {
        User currentUser = authService.getCurrentAuthenticatedUser();

        TicketAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found: " + attachmentId));

        Ticket ticket = attachment.getTicket();
        if (currentUser.getRole().getName() == RoleName.ROLE_EMPLOYEE && !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to access this attachment");
        }

        try {
            Path filePath = Paths.get(uploadDir).resolve(attachment.getStoredFileName()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found on disk");
            }
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("File path error: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public TicketAttachment getAttachmentEntity(Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment record not found: " + attachmentId));
    }

    public AttachmentDto toDto(TicketAttachment a) {
        return new AttachmentDto(
                a.getId(),
                a.getTicket().getId(),
                a.getComment() != null ? a.getComment().getId() : null,
                a.getFileName(),
                a.getFileType(),
                a.getFileSize(),
                a.getUploadedBy().getId(),
                a.getUploadedBy().getFullName(),
                a.getCreatedAt(),
                "/api/attachments/" + a.getId() + "/download"
        );
    }
}
