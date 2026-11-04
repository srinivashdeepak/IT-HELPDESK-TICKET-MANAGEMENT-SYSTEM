package com.helpdesk.repository;

import com.helpdesk.entity.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {
    List<TicketComment> findByTicket_IdOrderByCreatedAtAsc(Long ticketId);
    List<TicketComment> findByTicket_IdAndInternalFalseOrderByCreatedAtAsc(Long ticketId);
}
