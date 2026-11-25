package com.helpdesk.repository;

import com.helpdesk.entity.TicketFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketFeedbackRepository extends JpaRepository<TicketFeedback, Long> {
    Optional<TicketFeedback> findByTicket_Id(Long ticketId);
    boolean existsByTicket_Id(Long ticketId);

    @Query("SELECT AVG(f.rating) FROM TicketFeedback f WHERE f.ticket.assignedTo.id = :agentId")
    Double getAverageRatingForAgent(@Param("agentId") Long agentId);

    @Query("SELECT f FROM TicketFeedback f ORDER BY f.createdAt DESC")
    List<TicketFeedback> findAllRecent();
}
