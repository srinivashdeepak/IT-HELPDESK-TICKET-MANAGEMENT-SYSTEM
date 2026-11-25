package com.helpdesk.dto;

import java.time.LocalDateTime;

public class AttachmentDto {
    private Long id;
    private Long ticketId;
    private Long commentId;
    private String fileName;
    private String fileType;
    private long fileSize;
    private Long uploadedById;
    private String uploadedByName;
    private LocalDateTime createdAt;
    private String downloadUrl;

    public AttachmentDto() {}

    public AttachmentDto(Long id, Long ticketId, Long commentId, String fileName, String fileType, long fileSize, Long uploadedById, String uploadedByName, LocalDateTime createdAt, String downloadUrl) {
        this.id = id;
        this.ticketId = ticketId;
        this.commentId = commentId;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.uploadedById = uploadedById;
        this.uploadedByName = uploadedByName;
        this.createdAt = createdAt;
        this.downloadUrl = downloadUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public Long getCommentId() {
        return commentId;
    }

    public void setCommentId(Long commentId) {
        this.commentId = commentId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public long getFileSize() {
        return fileSize;
    }

    public void setFileSize(long fileSize) {
        this.fileSize = fileSize;
    }

    public Long getUploadedById() {
        return uploadedById;
    }

    public void setUploadedById(Long uploadedById) {
        this.uploadedById = uploadedById;
    }

    public String getUploadedByName() {
        return uploadedByName;
    }

    public void setUploadedByName(String uploadedByName) {
        this.uploadedByName = uploadedByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getDownloadUrl() {
        return downloadUrl;
    }

    public void setDownloadUrl(String downloadUrl) {
        this.downloadUrl = downloadUrl;
    }
}
