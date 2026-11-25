package com.helpdesk.repository;

import com.helpdesk.entity.SlaRule;
import com.helpdesk.entity.TicketPriority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SlaRuleRepository extends JpaRepository<SlaRule, Long> {
    Optional<SlaRule> findByPriority(TicketPriority priority);
    List<SlaRule> findByActiveTrue();
    boolean existsByPriority(TicketPriority priority);
}
