package com.helpdesk.repository;

import com.helpdesk.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    @Query("SELECT a FROM Announcement a WHERE a.active = true AND " +
           ":now BETWEEN a.startDate AND a.endDate ORDER BY a.createdAt DESC")
    List<Announcement> findActiveAnnouncements(@Param("now") LocalDateTime now);

    List<Announcement> findAllByOrderByCreatedAtDesc();
}
