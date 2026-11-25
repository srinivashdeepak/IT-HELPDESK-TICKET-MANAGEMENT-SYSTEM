package com.helpdesk.controller;

import com.helpdesk.dto.ApiResponse;
import com.helpdesk.dto.AttachmentDto;
import com.helpdesk.entity.TicketAttachment;
import com.helpdesk.service.AttachmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {

    @Autowired
    private AttachmentService attachmentService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<AttachmentDto>> uploadAttachment(
            @RequestParam("ticketId") Long ticketId,
            @RequestParam(value = "commentId", required = false) Long commentId,
            @RequestParam("file") MultipartFile file) {
        AttachmentDto uploaded = attachmentService.uploadAttachment(ticketId, commentId, file);
        return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", uploaded));
    }

    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<ApiResponse<List<AttachmentDto>>> getTicketAttachments(@PathVariable Long ticketId) {
        List<AttachmentDto> attachments = attachmentService.getTicketAttachments(ticketId);
        return ResponseEntity.ok(ApiResponse.success(attachments));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable Long id) {
        Resource fileResource = attachmentService.loadFileAsResource(id);
        TicketAttachment entity = attachmentService.getAttachmentEntity(id);

        String contentType = entity.getFileType();
        if (contentType == null || contentType.isBlank()) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + entity.getFileName() + "\"")
                .body(fileResource);
    }
}
