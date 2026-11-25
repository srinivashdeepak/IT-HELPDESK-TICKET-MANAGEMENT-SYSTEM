package com.helpdesk.controller;

import com.helpdesk.dto.AnnouncementDto;
import com.helpdesk.dto.ApiResponse;
import com.helpdesk.service.AnnouncementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    @Autowired
    private AnnouncementService announcementService;

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<AnnouncementDto>>> getActiveAnnouncements() {
        return ResponseEntity.ok(ApiResponse.success(announcementService.getActiveAnnouncements()));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<AnnouncementDto>>> getAllAnnouncements() {
        return ResponseEntity.ok(ApiResponse.success(announcementService.getAllAnnouncements()));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<AnnouncementDto>> createAnnouncement(@Valid @RequestBody AnnouncementDto dto) {
        AnnouncementDto created = announcementService.createAnnouncement(dto);
        return ResponseEntity.ok(ApiResponse.success("Announcement published successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<AnnouncementDto>> updateAnnouncement(
            @PathVariable Long id,
            @Valid @RequestBody AnnouncementDto dto) {
        AnnouncementDto updated = announcementService.updateAnnouncement(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Announcement updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAnnouncement(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.ok(ApiResponse.success("Announcement removed", null));
    }
}
