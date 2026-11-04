package com.helpdesk.dto;

import jakarta.validation.constraints.NotBlank;

public class CommentRequest {

    @NotBlank(message = "Comment text cannot be empty")
    private String commentText;

    private boolean internal = false;

    public CommentRequest() {}

    public String getCommentText() {
        return commentText;
    }

    public void setCommentText(String commentText) {
        this.commentText = commentText;
    }

    public boolean isInternal() {
        return internal;
    }

    public void setInternal(boolean internal) {
        this.internal = internal;
    }
}
