package com.helpdesk.service;

import com.helpdesk.dto.AnnouncementDto;
import com.helpdesk.entity.Announcement;
import com.helpdesk.entity.User;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnnouncementService {

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private AuthService authService;

    @Transactional(readOnly = true)
    public List<AnnouncementDto> getActiveAnnouncements() {
        return announcementRepository.findActiveAnnouncements(LocalDateTime.now())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AnnouncementDto> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AnnouncementDto createAnnouncement(AnnouncementDto dto) {
        User creator = authService.getCurrentAuthenticatedUser();

        Announcement a = new Announcement(
                dto.getTitle().trim(),
                dto.getContent().trim(),
                dto.getPriority(),
                dto.getStartDate() != null ? dto.getStartDate() : LocalDateTime.now(),
                dto.getEndDate() != null ? dto.getEndDate() : LocalDateTime.now().plusDays(7),
                creator
        );
        a.setActive(dto.isActive());

        return toDto(announcementRepository.save(a));
    }

    @Transactional
    public AnnouncementDto updateAnnouncement(Long id, AnnouncementDto dto) {
        Announcement a = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found: " + id));

        a.setTitle(dto.getTitle().trim());
        a.setContent(dto.getContent().trim());
        a.setPriority(dto.getPriority());
        if (dto.getStartDate() != null) a.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null) a.setEndDate(dto.getEndDate());
        a.setActive(dto.isActive());

        return toDto(announcementRepository.save(a));
    }

    @Transactional
    public void deleteAnnouncement(Long id) {
        if (!announcementRepository.existsById(id)) {
            throw new ResourceNotFoundException("Announcement not found: " + id);
        }
        announcementRepository.deleteById(id);
    }

    public AnnouncementDto toDto(Announcement a) {
        AnnouncementDto dto = new AnnouncementDto();
        dto.setId(a.getId());
        dto.setTitle(a.getTitle());
        dto.setContent(a.getContent());
        dto.setPriority(a.getPriority());
        dto.setStartDate(a.getStartDate());
        dto.setEndDate(a.getEndDate());
        dto.setActive(a.isActive());
        if (a.getCreatedBy() != null) {
            dto.setCreatedById(a.getCreatedBy().getId());
            dto.setCreatedByName(a.getCreatedBy().getFullName());
        }
        dto.setCreatedAt(a.getCreatedAt());
        return dto;
    }
}
