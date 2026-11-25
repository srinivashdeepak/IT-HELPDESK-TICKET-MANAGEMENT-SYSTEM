package com.helpdesk.repository;

import com.helpdesk.entity.KbArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KbArticleRepository extends JpaRepository<KbArticle, Long> {
    List<KbArticle> findByPublishedTrueOrderByCreatedAtDesc();
    List<KbArticle> findByCategory_IdAndPublishedTrue(Long categoryId);

    @Query("SELECT k FROM KbArticle k WHERE k.published = true AND " +
           "(LOWER(k.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(k.content) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY k.helpfulCount DESC")
    List<KbArticle> searchArticles(@Param("query") String query);

    @Query("SELECT k FROM KbArticle k WHERE k.published = true AND " +
           "(:categoryId IS NULL OR k.category.id = :categoryId) AND " +
           "(:query IS NULL OR LOWER(k.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(k.content) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY k.helpfulCount DESC")
    List<KbArticle> filterArticles(@Param("categoryId") Long categoryId, @Param("query") String query);
}
