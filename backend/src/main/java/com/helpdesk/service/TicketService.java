package com.helpdesk.service;

import com.helpdesk.dto.*;
import com.helpdesk.entity.*;
import com.helpdesk.exception.BadRequestException;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.exception.UnauthorizedException;
import com.helpdesk.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
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
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority() != null ? request.getPriority() : TicketPriority.MEDIUM);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCategory(category);
        ticket.setCreatedBy(currentUser);

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
            // Employees can strictly only access tickets created by themselves
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
    public TicketDetailResponse getTicketDetail(Long id) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        RoleName role = currentUser.getRole().getName();

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        // Enforce authorization for employees
        if (role == RoleName.ROLE_EMPLOYEE && !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You do not have permission to view this ticket");
        }

        List<TicketComment> comments;
        if (role == RoleName.ROLE_EMPLOYEE) {
            // Hide internal support staff notes from regular employees
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

        TicketResponse response = toTicketResponse(ticket);
        response.setCommentCount(commentDtos.size());

        return new TicketDetailResponse(response, commentDtos, historyDtos);
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

        // Record assignment
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

        return toTicketResponse(savedTicket);
    }

    @Transactional
    public TicketResponse updateStatus(Long ticketId, TicketStatusUpdateRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        RoleName role = currentUser.getRole().getName();

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        // Employee can only close their own ticket if it is already resolved
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
                ticket.setResolutionNotes(request.getResolutionNotes());
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
    public CommentDto addComment(Long ticketId, CommentRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        RoleName role = currentUser.getRole().getName();

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        // Employee cannot view or comment on someone else's ticket
        if (role == RoleName.ROLE_EMPLOYEE && !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to comment on this ticket");
        }

        boolean isInternal = request.isInternal();
        // Regular employees can never write internal staff notes
        if (role == RoleName.ROLE_EMPLOYEE) {
            isInternal = false;
        }

        TicketComment comment = new TicketComment(ticket, currentUser, request.getCommentText(), isInternal);
        TicketComment savedComment = commentRepository.save(comment);

        // Update ticket updated_at
        ticket.setUpdatedAt(LocalDateTime.now());
        ticketRepository.save(ticket);

        // Record audit
        String noteType = isInternal ? "Internal Note" : "Public Comment";
        TicketHistory history = new TicketHistory(
                ticket,
                "COMMENT_ADDED",
                null,
                noteType + " added by " + currentUser.getFullName(),
                currentUser
        );
        historyRepository.save(history);

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
