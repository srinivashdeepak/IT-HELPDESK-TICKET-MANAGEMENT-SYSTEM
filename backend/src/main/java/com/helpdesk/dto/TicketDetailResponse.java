package com.helpdesk.dto;

import java.util.ArrayList;
import java.util.List;

public class TicketDetailResponse {
    private TicketResponse ticket;
    private List<CommentDto> comments = new ArrayList<>();
    private List<HistoryDto> history = new ArrayList<>();

    public TicketDetailResponse() {}

    public TicketDetailResponse(TicketResponse ticket, List<CommentDto> comments, List<HistoryDto> history) {
        this.ticket = ticket;
        this.comments = comments;
        this.history = history;
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
}
