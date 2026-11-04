package com.helpdesk.repository;

import com.helpdesk.entity.Ticket;
import com.helpdesk.entity.TicketPriority;
import com.helpdesk.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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

    @Query("SELECT t FROM Ticket t WHERE " +
           "(:userId IS NULL OR t.createdBy.id = :userId) AND " +
           "(:assignedId IS NULL OR t.assignedTo.id = :assignedId) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:categoryId IS NULL OR t.category.id = :categoryId) AND " +
           "(:query IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(t.ticketCode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY t.createdAt DESC")
    List<Ticket> filterTickets(
            @Param("userId") Long userId,
            @Param("assignedId") Long assignedId,
            @Param("status") TicketStatus status,
            @Param("priority") TicketPriority priority,
            @Param("categoryId") Long categoryId,
            @Param("query") String query
    );

    @Query("SELECT MAX(t.id) FROM Ticket t")
    Long getMaxTicketId();
}
