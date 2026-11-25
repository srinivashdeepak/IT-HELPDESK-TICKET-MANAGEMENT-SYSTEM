package com.helpdesk.repository;

import com.helpdesk.entity.Ticket;
import com.helpdesk.entity.TicketPriority;
import com.helpdesk.entity.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Optional<Ticket> findByTicketCode(String ticketCode);

    List<Ticket> findByCreatedBy_IdOrderByCreatedAtDesc(Long createdById);

    List<Ticket> findByAssignedTo_IdOrderByCreatedAtDesc(Long assignedToId);

    long countByStatus(TicketStatus status);

    long countByPriority(TicketPriority priority);

    long countByCreatedBy_Id(Long createdById);

    long countByCreatedBy_IdAndStatus(Long createdById, TicketStatus status);

    long countByAssignedTo_Id(Long assignedToId);

    long countByAssignedTo_IdAndStatus(Long assignedToId, TicketStatus status);

    long countBySlaBreachedTrue();

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.assignedTo.id = :agentId AND t.status NOT IN ('RESOLVED', 'CLOSED')")
    long countActiveTicketsForAgent(@Param("agentId") Long agentId);

    @Query("SELECT t FROM Ticket t WHERE t.status NOT IN ('RESOLVED', 'CLOSED') AND t.resolutionDeadline IS NOT NULL AND t.resolutionDeadline < :now AND t.slaBreached = false")
    List<Ticket> findOverdueTicketsAwaitingBreach(@Param("now") LocalDateTime now);

    @Query("SELECT t FROM Ticket t WHERE " +
           "(:userId IS NULL OR t.createdBy.id = :userId) AND " +
           "(:assignedId IS NULL OR t.assignedTo.id = :assignedId) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:categoryId IS NULL OR t.category.id = :categoryId) AND " +
           "(:query IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(t.ticketCode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(t.createdBy.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " (t.assignedTo IS NOT NULL AND LOWER(t.assignedTo.fullName) LIKE LOWER(CONCAT('%', :query, '%')))) " +
           "ORDER BY t.createdAt DESC")
    List<Ticket> filterTickets(
            @Param("userId") Long userId,
            @Param("assignedId") Long assignedId,
            @Param("status") TicketStatus status,
            @Param("priority") TicketPriority priority,
            @Param("categoryId") Long categoryId,
            @Param("query") String query
    );

    @Query("SELECT t FROM Ticket t WHERE " +
           "(:userId IS NULL OR t.createdBy.id = :userId) AND " +
           "(:assignedId IS NULL OR t.assignedTo.id = :assignedId) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:categoryId IS NULL OR t.category.id = :categoryId) AND " +
           "(:startDate IS NULL OR t.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR t.createdAt <= :endDate) AND " +
           "(:query IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(t.ticketCode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(t.createdBy.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " (t.assignedTo IS NOT NULL AND LOWER(t.assignedTo.fullName) LIKE LOWER(CONCAT('%', :query, '%'))))")
    Page<Ticket> searchTicketsPaged(
            @Param("userId") Long userId,
            @Param("assignedId") Long assignedId,
            @Param("status") TicketStatus status,
            @Param("priority") TicketPriority priority,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("SELECT MAX(t.id) FROM Ticket t")
    Long getMaxTicketId();
}
