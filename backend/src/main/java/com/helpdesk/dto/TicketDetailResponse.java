package com.helpdesk.dto;

import java.util.ArrayList;
import java.util.List;

public class TicketDetailResponse {
    private TicketResponse ticket;
    private List<CommentDto> comments = new ArrayList<>();
    private List<HistoryDto> history = new ArrayList<>();
    private List<AttachmentDto> attachments = new ArrayList<>();
    private TicketFeedbackDto feedback;

    public TicketDetailResponse() {}

    public TicketDetailResponse(TicketResponse ticket, List<CommentDto> comments, List<HistoryDto> history, List<AttachmentDto> attachments, TicketFeedbackDto feedback) {
        this.ticket = ticket;
        this.comments = comments;
        this.history = history;
        this.attachments = attachments;
        this.feedback = feedback;
    }

    public TicketResponse getTicket() {
        return ticket;
    }

    public void setTicket(TicketResponse ticket) {
        this.ticket = ticket;
    }

    public List<CommentDto> getComments() {
        return comments;
    }

    public void setComments(List<CommentDto> comments) {
        this.comments = comments;
    }

    public List<HistoryDto> getHistory() {
        return history;
    }

    public void setHistory(List<HistoryDto> history) {
        this.history = history;
    }

    public List<AttachmentDto> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<AttachmentDto> attachments) {
        this.attachments = attachments;
    }

    public TicketFeedbackDto getFeedback() {
        return feedback;
    }

    public void setFeedback(TicketFeedbackDto feedback) {
        this.feedback = feedback;
    }
}
