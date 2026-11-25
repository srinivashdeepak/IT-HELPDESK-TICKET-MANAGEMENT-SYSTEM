package com.helpdesk.service;

import com.helpdesk.dto.KbArticleCreateRequest;
import com.helpdesk.dto.KbArticleDto;
import com.helpdesk.entity.Category;
import com.helpdesk.entity.KbArticle;
import com.helpdesk.entity.KbFeedback;
import com.helpdesk.entity.User;
import com.helpdesk.exception.BadRequestException;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.repository.CategoryRepository;
import com.helpdesk.repository.KbArticleRepository;
import com.helpdesk.repository.KbFeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class KbService {

    @Autowired
    private KbArticleRepository kbArticleRepository;

    @Autowired
    private KbFeedbackRepository kbFeedbackRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private AuthService authService;

    @Transactional(readOnly = true)
    public List<KbArticleDto> getArticles(Long categoryId, String query) {
        String trimmed = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        return kbArticleRepository.filterArticles(categoryId, trimmed)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public KbArticleDto getArticleById(Long id) {
        KbArticle article = kbArticleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge base article not found: " + id));

        // Increment view count
        article.setViewCount(article.getViewCount() + 1);
        kbArticleRepository.save(article);

        return toDto(article);
    }

    @Transactional
    public KbArticleDto createArticle(KbArticleCreateRequest request) {
        User author = authService.getCurrentAuthenticatedUser();
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.getCategoryId()));

        KbArticle article = new KbArticle(
                request.getTitle().trim(),
                request.getContent().trim(),
                category,
                author
        );
        article.setPublished(request.isPublished());

        return toDto(kbArticleRepository.save(article));
    }

    @Transactional
    public KbArticleDto updateArticle(Long id, KbArticleCreateRequest request) {
        KbArticle article = kbArticleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.getCategoryId()));

        article.setTitle(request.getTitle().trim());
        article.setContent(request.getContent().trim());
        article.setCategory(category);
        article.setPublished(request.isPublished());

        return toDto(kbArticleRepository.save(article));
    }

    @Transactional
    public void deleteArticle(Long id) {
        if (!kbArticleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Article not found: " + id);
        }
        kbArticleRepository.deleteById(id);
    }

    @Transactional
    public KbArticleDto voteHelpful(Long id, boolean isHelpful) {
        User user = authService.getCurrentAuthenticatedUser();
        KbArticle article = kbArticleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + id));

        Optional<KbFeedback> existing = kbFeedbackRepository.findByArticle_IdAndUser_Id(id, user.getId());

        if (existing.isPresent()) {
            KbFeedback fb = existing.get();
            if (fb.isHelpful() == isHelpful) {
                throw new BadRequestException("You have already submitted this feedback for this article");
            }
            // Reverse previous vote
            if (fb.isHelpful()) {
                article.setHelpfulCount(Math.max(0, article.getHelpfulCount() - 1));
                article.setNotHelpfulCount(article.getNotHelpfulCount() + 1);
            } else {
                article.setNotHelpfulCount(Math.max(0, article.getNotHelpfulCount() - 1));
                article.setHelpfulCount(article.getHelpfulCount() + 1);
            }
            fb.setHelpful(isHelpful);
            kbFeedbackRepository.save(fb);
        } else {
            KbFeedback feedback = new KbFeedback(article, user, isHelpful);
            kbFeedbackRepository.save(feedback);
            if (isHelpful) {
                article.setHelpfulCount(article.getHelpfulCount() + 1);
            } else {
                article.setNotHelpfulCount(article.getNotHelpfulCount() + 1);
            }
        }

        return toDto(kbArticleRepository.save(article));
    }

    @Transactional(readOnly = true)
    public List<KbArticleDto> getSuggestionsForIssue(String keywords, Long categoryId) {
        if (keywords == null || keywords.trim().isEmpty()) {
            if (categoryId != null) {
                return kbArticleRepository.findByCategory_IdAndPublishedTrue(categoryId)
                        .stream().limit(4).map(this::toDto).collect(Collectors.toList());
            }
            return List.of();
        }

        String search = keywords.trim();
        List<KbArticle> articles = kbArticleRepository.searchArticles(search);
        if (articles.isEmpty() && categoryId != null) {
            articles = kbArticleRepository.findByCategory_IdAndPublishedTrue(categoryId);
        }

        return articles.stream().limit(4).map(this::toDto).collect(Collectors.toList());
    }

    public KbArticleDto toDto(KbArticle a) {
        KbArticleDto dto = new KbArticleDto();
        dto.setId(a.getId());
        dto.setTitle(a.getTitle());
        dto.setContent(a.getContent());
        if (a.getCategory() != null) {
            dto.setCategoryId(a.getCategory().getId());
            dto.setCategoryName(a.getCategory().getName());
        }
        if (a.getAuthor() != null) {
            dto.setAuthorId(a.getAuthor().getId());
            dto.setAuthorName(a.getAuthor().getFullName());
        }
        dto.setViewCount(a.getViewCount());
        dto.setHelpfulCount(a.getHelpfulCount());
        dto.setNotHelpfulCount(a.getNotHelpfulCount());
        dto.setPublished(a.isPublished());
        dto.setCreatedAt(a.getCreatedAt());
        dto.setUpdatedAt(a.getUpdatedAt());
        return dto;
    }
}
