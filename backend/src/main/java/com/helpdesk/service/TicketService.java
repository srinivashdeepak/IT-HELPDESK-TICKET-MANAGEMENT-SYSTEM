package com.helpdesk.service;

import com.helpdesk.dto.*;
import com.helpdesk.entity.*;
import com.helpdesk.exception.BadRequestException;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.exception.UnauthorizedException;
import com.helpdesk.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TicketCommentRepository commentRepository;

    @Autowired
    private TicketAssignmentRepository assignmentRepository;

    @Autowired
    private TicketHistoryRepository historyRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private SlaService slaService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AttachmentService attachmentService;

    @Autowired
    private FeedbackService feedbackService;

    @Autowired
    private AuditService auditService;

    @Transactional
    public TicketResponse createTicket(TicketCreateRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Long maxId = ticketRepository.getMaxTicketId();
        long nextId = (maxId != null ? maxId : 0L) + 1L;
        String ticketCode = String.format("HD-%04d", nextId);

        Ticket ticket = new Ticket();
        ticket.setTicketCode(ticketCode);
        ticket.setTitle(request.getTitle().trim());
        ticket.setDescription(request.getDescription().trim());
        ticket.setPriority(request.getPriority() != null ? request.getPriority() : TicketPriority.MEDIUM);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCategory(category);
        ticket.setCreatedBy(currentUser);

        // Apply SLA deadlines based on priority
        slaService.applySlaDeadlines(ticket);

        Ticket savedTicket = ticketRepository.save(ticket);

        // Record creation in history audit log
        TicketHistory history = new TicketHistory(
                savedTicket,
                "CREATED",
                null,
                TicketStatus.OPEN.name(),
                currentUser
        );
        historyRepository.save(history);

        // Notify user of ticket creation
        notificationService.createNotification(
                currentUser,
                "Ticket Logged: " + savedTicket.getTicketCode(),
                "Your support request '" + savedTicket.getTitle() + "' has been successfully registered with priority " + savedTicket.getPriority() + ".",
                NotificationType.TICKET_CREATED,
                savedTicket.getId()
        );

        auditService.logAction("TICKET_CREATED", "Logged incident " + savedTicket.getTicketCode(), currentUser);

        return toTicketResponse(savedTicket);
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getTickets(
            TicketStatus status,
            TicketPriority priority,
            Long categoryId,
            String query,
            Boolean assignedToMe,
            Boolean myTicketsOnly) {

        User currentUser = authService.getCurrentAuthenticatedUser();
        RoleName role = currentUser.getRole().getName();

        Long filterUserId = null;
        Long filterAssignedId = null;

        if (role == RoleName.ROLE_EMPLOYEE) {
            filterUserId = currentUser.getId();
        } else if (role == RoleName.ROLE_AGENT) {
            if (Boolean.TRUE.equals(assignedToMe)) {
                filterAssignedId = currentUser.getId();
            } else if (Boolean.TRUE.equals(myTicketsOnly)) {
                filterUserId = currentUser.getId();
            }
        } else if (role == RoleName.ROLE_ADMIN) {
            if (Boolean.TRUE.equals(myTicketsOnly)) {
                filterUserId = currentUser.getId();
            } else if (Boolean.TRUE.equals(assignedToMe)) {
                filterAssignedId = currentUser.getId();
            }
        }

        String search = (query != null && !query.trim().isEmpty()) ? query.trim() : null;

        List<Ticket> tickets = ticketRepository.filterTickets(
                filterUserId,
                filterAssignedId,
                status,
                priority,
                categoryId,
                search
        );

        return tickets.stream().map(this::toTicketResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<TicketResponse> searchTicketsPaged(
            int page,
            int size,
            String sortBy,
            String sortDirection,
            TicketStatus status,
            TicketPriority priority,
            Long categoryId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String query,
            Boolean assignedToMe,
            Boolean myTicketsOnly) {

        User currentUser = authService.getCurrentAuthenticatedUser();
        RoleName role = currentUser.getRole().getName();

        Long filterUserId = null;
        Long filterAssignedId = null;

        if (role == RoleName.ROLE_EMPLOYEE) {
            filterUserId = currentUser.getId();
        } else if (role == RoleName.ROLE_AGENT) {
            if (Boolean.TRUE.equals(assignedToMe)) {
                filterAssignedId = currentUser.getId();
            } else if (Boolean.TRUE.equals(myTicketsOnly)) {
                filterUserId = currentUser.getId();
            }
        } else if (role == RoleName.ROLE_ADMIN) {
            if (Boolean.TRUE.equals(myTicketsOnly)) {
                filterUserId = currentUser.getId();
            } else if (Boolean.TRUE.equals(assignedToMe)) {
                filterAssignedId = currentUser.getId();
            }
        }

        String sortProp = (sortBy != null && !sortBy.trim().isEmpty()) ? sortBy : "createdAt";
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortProp));

        String search = (query != null && !query.trim().isEmpty()) ? query.trim() : null;

        Page<Ticket> ticketPage = ticketRepository.searchTicketsPaged(
                filterUserId,
                filterAssignedId,
                status,
                priority,
                categoryId,
                startDate,
                endDate,
                search,
                pageable
        );

        List<TicketResponse> dtos = ticketPage.getContent().stream()
                .map(this::toTicketResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(
                dtos,
                ticketPage.getNumber(),
                ticketPage.getSize(),
                ticketPage.getTotalElements(),
                ticketPage.getTotalPages(),
                ticketPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public TicketDetailResponse getTicketDetail(Long id) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        RoleName role = currentUser.getRole().getName();

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        if (role == RoleName.ROLE_EMPLOYEE && !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You do not have permission to view this ticket");
        }

        List<TicketComment> comments;
        if (role == RoleName.ROLE_EMPLOYEE) {
            comments = commentRepository.findByTicket_IdAndInternalFalseOrderByCreatedAtAsc(id);
        } else {
            comments = commentRepository.findByTicket_IdOrderByCreatedAtAsc(id);
        }

        List<CommentDto> commentDtos = comments.stream()
                .map(this::toCommentDto)
                .collect(Collectors.toList());

        List<HistoryDto> historyDtos = historyRepository.findByTicket_IdOrderByCreatedAtDesc(id)
                .stream()
                .map(this::toHistoryDto)
                .collect(Collectors.toList());

        List<AttachmentDto> attachments = attachmentService.getTicketAttachments(id);
        TicketFeedbackDto feedback = feedbackService.getFeedbackForTicket(id);

        TicketResponse response = toTicketResponse(ticket);
        response.setCommentCount(commentDtos.size());
        response.setAttachmentCount(attachments.size());

        return new TicketDetailResponse(response, commentDtos, historyDtos, attachments, feedback);
    }

    @Transactional
    public TicketResponse assignTicket(Long ticketId, TicketAssignRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        RoleName role = currentUser.getRole().getName();

        if (role == RoleName.ROLE_EMPLOYEE) {
            throw new UnauthorizedException("Employees are not authorized to assign tickets");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        User agent = userRepository.findById(request.getAgentId())
                .orElseThrow(() -> new ResourceNotFoundException("Support agent not found with id: " + request.getAgentId()));

        if (agent.getRole().getName() != RoleName.ROLE_AGENT && agent.getRole().getName() != RoleName.ROLE_ADMIN) {
            throw new BadRequestException("User is not an authorized support agent");
        }

        String previousAssignee = ticket.getAssignedTo() != null ? ticket.getAssignedTo().getFullName() : "Unassigned";
        ticket.setAssignedTo(agent);

        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.ASSIGNED);
        }

        Ticket savedTicket = ticketRepository.save(ticket);

        // Record assignment history
        TicketAssignment assignment = new TicketAssignment(
                savedTicket,
                currentUser,
                agent,
                request.getNotes()
        );
        assignmentRepository.save(assignment);

        // Record audit
        TicketHistory history = new TicketHistory(
                savedTicket,
                "ASSIGNED",
                previousAssignee,
                agent.getFullName(),
                currentUser
        );
        historyRepository.save(history);

        // Notify assigned agent
        notificationService.createNotification(
                agent,
                "New Ticket Assigned: " + ticket.getTicketCode(),
                String.format("You have been assigned to incident '%s' (Priority: %s).",
                        ticket.getTitle(), ticket.getPriority()),
                NotificationType.TICKET_ASSIGNED,
                ticket.getId()
        );

        auditService.logAction("TICKET_ASSIGNED", "Assigned ticket " + ticket.getTicketCode() + " to " + agent.getFullName(), currentUser);

        return toTicketResponse(savedTicket);
    }

    @Transactional
    public TicketResponse updateStatus(Long ticketId, TicketStatusUpdateRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        RoleName role = currentUser.getRole().getName();

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        if (role == RoleName.ROLE_EMPLOYEE) {
            if (!ticket.getCreatedBy().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You can only modify your own tickets");
            }
            if (request.getStatus() != TicketStatus.CLOSED) {
                throw new UnauthorizedException("Employees can only mark their resolved tickets as CLOSED");
            }
        }

        TicketStatus oldStatus = ticket.getStatus();
        TicketStatus newStatus = request.getStatus();

        ticket.setStatus(newStatus);

        if (newStatus == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
            if (request.getResolutionNotes() != null && !request.getResolutionNotes().trim().isEmpty()) {
                ticket.setResolutionNotes(request.getResolutionNotes().trim());
            }
        } else if (newStatus == TicketStatus.CLOSED && ticket.getResolvedAt() == null) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

        Ticket savedTicket = ticketRepository.save(ticket);

        // Record audit
        TicketHistory history = new TicketHistory(
                savedTicket,
                "STATUS_CHANGE",
                oldStatus.name(),
                newStatus.name(),
                currentUser
        );
        historyRepository.save(history);

        // Notify ticket creator of status transition
        notificationService.createNotification(
                ticket.getCreatedBy(),
                "Status Updated: " + ticket.getTicketCode() + " is now " + newStatus,
                String.format("Your ticket '%s' has transitioned from %s to %s.",
                        ticket.getTitle(), oldStatus, newStatus),
                NotificationType.STATUS_CHANGED,
                ticket.getId()
        );

        return toTicketResponse(savedTicket);
    }

    @Transactional
    public TicketResponse updatePriority(Long ticketId, TicketPriority newPriority) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        RoleName role = currentUser.getRole().getName();

        if (role == RoleName.ROLE_EMPLOYEE) {
            throw new UnauthorizedException("Employees cannot modify ticket priority after submission");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        TicketPriority oldPriority = ticket.getPriority();
        ticket.setPriority(newPriority);

        // Recompute SLA with updated priority
        slaService.applySlaDeadlines(ticket);

        Ticket savedTicket = ticketRepository.save(ticket);

        TicketHistory history = new TicketHistory(
                savedTicket,
                "PRIORITY_CHANGE",
                oldPriority.name(),
                newPriority.name(),
                currentUser
        );
        historyRepository.save(history);

        return toTicketResponse(savedTicket);
    }

    @Transactional
    public TicketResponse reopenTicket(Long ticketId, ReopenTicketRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        if (currentUser.getRole().getName() == RoleName.ROLE_EMPLOYEE && !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are only allowed to reopen your own tickets");
        }

        if (ticket.getStatus() != TicketStatus.RESOLVED && ticket.getStatus() != TicketStatus.CLOSED) {
            throw new BadRequestException("Only Resolved or Closed tickets can be reopened");
        }

        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        ticket.setReopened(true);
        ticket.setReopenedAt(LocalDateTime.now());
        ticket.setReopeningReason(request.getReason().trim());

        // Refresh SLA deadline for reopened incident
        slaService.applySlaDeadlines(ticket);

        Ticket savedTicket = ticketRepository.save(ticket);

        // Record in history audit
        TicketHistory history = new TicketHistory(
                savedTicket,
                "TICKET_REOPENED",
                oldStatus.name(),
                "REOPENED (IN_PROGRESS): " + request.getReason().trim(),
                currentUser
        );
        historyRepository.save(history);

        // Notify assigned agent
        if (ticket.getAssignedTo() != null) {
            notificationService.createNotification(
                    ticket.getAssignedTo(),
                    "Ticket Reopened: " + ticket.getTicketCode(),
                    String.format("Ticket '%s' has been reopened by %s. Reason: %s",
                            ticket.getTitle(), currentUser.getFullName(), request.getReason()),
                    NotificationType.TICKET_REOPENED,
                    ticket.getId()
            );
        }

        auditService.logAction("TICKET_REOPENED", "Reopened ticket " + ticket.getTicketCode() + ". Reason: " + request.getReason(), currentUser);

        return toTicketResponse(savedTicket);
    }

    @Transactional
    public CommentDto addComment(Long ticketId, CommentRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        RoleName role = currentUser.getRole().getName();

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        if (role == RoleName.ROLE_EMPLOYEE && !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to comment on this ticket");
        }

        boolean isInternal = request.isInternal();
        if (role == RoleName.ROLE_EMPLOYEE) {
            isInternal = false;
        }

        // Record first response timestamp if an agent/admin comments and it hasn't been set
        if ((role == RoleName.ROLE_AGENT || role == RoleName.ROLE_ADMIN) && ticket.getFirstRespondedAt() == null) {
            ticket.setFirstRespondedAt(LocalDateTime.now());
        }

        TicketComment comment = new TicketComment(ticket, currentUser, request.getCommentText(), isInternal);
        TicketComment savedComment = commentRepository.save(comment);

        ticket.setUpdatedAt(LocalDateTime.now());
        ticketRepository.save(ticket);

        String noteType = isInternal ? "Internal Note" : "Public Comment";
        TicketHistory history = new TicketHistory(
                ticket,
                "COMMENT_ADDED",
                null,
                noteType + " added by " + currentUser.getFullName(),
                currentUser
        );
        historyRepository.save(history);

        // Notify recipient if public comment
        if (!isInternal) {
            if (role == RoleName.ROLE_EMPLOYEE && ticket.getAssignedTo() != null) {
                notificationService.createNotification(
                        ticket.getAssignedTo(),
                        "New Message on " + ticket.getTicketCode(),
                        currentUser.getFullName() + ": " + request.getCommentText(),
                        NotificationType.STATUS_CHANGED,
                        ticket.getId()
                );
            } else if ((role == RoleName.ROLE_AGENT || role == RoleName.ROLE_ADMIN) && !currentUser.getId().equals(ticket.getCreatedBy().getId())) {
                notificationService.createNotification(
                        ticket.getCreatedBy(),
                        "Support Engineer replied to " + ticket.getTicketCode(),
                        currentUser.getFullName() + ": " + request.getCommentText(),
                        NotificationType.STATUS_CHANGED,
                        ticket.getId()
                );
            }
        }

        return toCommentDto(savedComment);
    }

    public TicketResponse toTicketResponse(Ticket t) {
        TicketResponse res = new TicketResponse();
        res.setId(t.getId());
        res.setTicketCode(t.getTicketCode());
        res.setTitle(t.getTitle());
        res.setDescription(t.getDescription());
        res.setPriority(t.getPriority());
        res.setStatus(t.getStatus());

        if (t.getCategory() != null) {
            res.setCategoryId(t.getCategory().getId());
            res.setCategoryName(t.getCategory().getName());
        }

        if (t.getCreatedBy() != null) {
            res.setCreatedById(t.getCreatedBy().getId());
            res.setCreatedByName(t.getCreatedBy().getFullName());
            res.setCreatedByEmail(t.getCreatedBy().getEmail());
            res.setCreatedByDepartment(t.getCreatedBy().getDepartment());
        }

        if (t.getAssignedTo() != null) {
            res.setAssignedToId(t.getAssignedTo().getId());
            res.setAssignedToName(t.getAssignedTo().getFullName());
            res.setAssignedToEmail(t.getAssignedTo().getEmail());
        }

        res.setResolutionNotes(t.getResolutionNotes());

        // SLA fields
        res.setResponseDeadline(t.getResponseDeadline());
        res.setResolutionDeadline(t.getResolutionDeadline());
        res.setFirstRespondedAt(t.getFirstRespondedAt());
        res.setSlaStatus(slaService.calculateCurrentSlaStatus(t));
        res.setSlaBreached(t.isSlaBreached());
        res.setEscalated(t.isEscalated());
        res.setEscalatedAt(t.getEscalatedAt());

        // Reopen fields
        res.setReopened(t.isReopened());
        res.setReopenedAt(t.getReopenedAt());
        res.setReopeningReason(t.getReopeningReason());

        res.setCreatedAt(t.getCreatedAt());
        res.setUpdatedAt(t.getUpdatedAt());
        res.setResolvedAt(t.getResolvedAt());
        return res;
    }

    public CommentDto toCommentDto(TicketComment c) {
        return new CommentDto(
                c.getId(),
                c.getTicket().getId(),
                c.getUser().getId(),
                c.getUser().getFullName(),
                c.getUser().getRole().getName().name(),
                c.getCommentText(),
                c.isInternal(),
                c.getCreatedAt()
        );
    }

    public HistoryDto toHistoryDto(TicketHistory h) {
        return new HistoryDto(
                h.getId(),
                h.getTicket().getId(),
                h.getAction(),
                h.getPreviousState(),
                h.getNewState(),
                h.getChangedBy().getId(),
                h.getChangedBy().getFullName(),
                h.getCreatedAt()
        );
    }
}
