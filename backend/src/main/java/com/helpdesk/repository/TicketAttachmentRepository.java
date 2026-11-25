package com.helpdesk.repository;

import com.helpdesk.entity.TicketAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, Long> {
    List<TicketAttachment> findByTicket_IdOrderByCreatedAtDesc(Long ticketId);
    List<TicketAttachment> findByComment_Id(Long commentId);
}
