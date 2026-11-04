package com.helpdesk.service;

import com.helpdesk.dto.CategoryDto;
import com.helpdesk.entity.Category;
import com.helpdesk.exception.BadRequestException;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getActiveCategories() {
        return categoryRepository.findByActiveTrueOrderByNameAsc().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return toDto(category);
    }

    @Transactional
    public CategoryDto createCategory(CategoryDto dto) {
        if (categoryRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Category with name '" + dto.getName() + "' already exists");
        }
        Category category = new Category(dto.getName(), dto.getDescription());
        category.setActive(dto.isActive());
        return toDto(categoryRepository.save(category));
    }

    @Transactional
    public CategoryDto updateCategory(Long id, CategoryDto dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setActive(dto.isActive());
        return toDto(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        category.setActive(false);
        categoryRepository.save(category);
    }

    public CategoryDto toDto(Category c) {
        return new CategoryDto(c.getId(), c.getName(), c.getDescription(), c.isActive(), c.getCreatedAt());
    }
}
