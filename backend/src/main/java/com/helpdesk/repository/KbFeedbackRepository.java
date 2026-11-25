package com.helpdesk.repository;

import com.helpdesk.entity.KbFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KbFeedbackRepository extends JpaRepository<KbFeedback, Long> {
    Optional<KbFeedback> findByArticle_IdAndUser_Id(Long articleId, Long userId);
    boolean existsByArticle_IdAndUser_Id(Long articleId, Long userId);
}
