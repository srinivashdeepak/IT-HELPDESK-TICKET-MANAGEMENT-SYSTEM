package com.helpdesk.controller;

import com.helpdesk.dto.ApiResponse;
import com.helpdesk.dto.KbArticleCreateRequest;
import com.helpdesk.dto.KbArticleDto;
import com.helpdesk.service.KbService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kb")
public class KbController {

    @Autowired
    private KbService kbService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<KbArticleDto>>> getArticles(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String query) {
        List<KbArticleDto> articles = kbService.getArticles(categoryId, query);
        return ResponseEntity.ok(ApiResponse.success(articles));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse<List<KbArticleDto>>> getSuggestions(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long categoryId) {
        List<KbArticleDto> suggestions = kbService.getSuggestionsForIssue(query, categoryId);
        return ResponseEntity.ok(ApiResponse.success(suggestions));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<KbArticleDto>> getArticleById(@PathVariable Long id) {
        KbArticleDto article = kbService.getArticleById(id);
        return ResponseEntity.ok(ApiResponse.success(article));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_AGENT')")
    public ResponseEntity<ApiResponse<KbArticleDto>> createArticle(@Valid @RequestBody KbArticleCreateRequest request) {
        KbArticleDto created = kbService.createArticle(request);
        return ResponseEntity.ok(ApiResponse.success("Article created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_AGENT')")
    public ResponseEntity<ApiResponse<KbArticleDto>> updateArticle(
            @PathVariable Long id,
            @Valid @RequestBody KbArticleCreateRequest request) {
        KbArticleDto updated = kbService.updateArticle(id, request);
        return ResponseEntity.ok(ApiResponse.success("Article updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteArticle(@PathVariable Long id) {
        kbService.deleteArticle(id);
        return ResponseEntity.ok(ApiResponse.success("Article deleted successfully", null));
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<ApiResponse<KbArticleDto>> voteHelpful(
            @PathVariable Long id,
            @RequestParam boolean helpful) {
        KbArticleDto voted = kbService.voteHelpful(id, helpful);
        return ResponseEntity.ok(ApiResponse.success("Feedback recorded", voted));
    }
}
