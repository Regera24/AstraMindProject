package az.schedule.backendservice.service.impl;

import az.schedule.backendservice.converter.CategoryConverter;
import az.schedule.backendservice.dto.CategoryDTO;
import az.schedule.backendservice.dto.request.category.CategoryRequest;
import az.schedule.backendservice.dto.response.PageResponse;
import az.schedule.backendservice.entity.Account;
import az.schedule.backendservice.entity.Category;
import az.schedule.backendservice.exception.AppException;
import az.schedule.backendservice.exception.ErrorCode;
import az.schedule.backendservice.repository.AccountRepository;
import az.schedule.backendservice.repository.CategoryRepository;
import az.schedule.backendservice.repository.TaskRepository;
import az.schedule.backendservice.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final AccountRepository accountRepository;
    private final TaskRepository taskRepository;
    private final CategoryConverter categoryConverter;

    @Override
    @Transactional
    public CategoryDTO createCategory(CategoryRequest request, Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));

        if (categoryRepository.existsByNameAndAccountId(request.getName(), accountId)) {
            throw new AppException(ErrorCode.CATEGORY_NAME_EXISTED);
        }

        Category category = categoryConverter.toEntity(request, account);
        Category savedCategory = categoryRepository.save(category);
        return categoryConverter.toDTO(savedCategory);
    }

    @Override
    @Transactional
    public CategoryDTO updateCategory(Long id, CategoryRequest request, Long accountId) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        if (!category.getAccount().getId().equals(accountId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        if (!category.getName().equals(request.getName()) &&
            categoryRepository.existsByNameAndAccountId(request.getName(), accountId)) {
            throw new AppException(ErrorCode.CATEGORY_NAME_EXISTED);
        }

        categoryConverter.updateEntity(category, request);
        Category updatedCategory = categoryRepository.save(category);
        return categoryConverter.toDTO(updatedCategory);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id, Long accountId) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        if (!category.getAccount().getId().equals(accountId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        long taskCount = taskRepository.countByCategoryId(id);
        if (taskCount > 0) {
            throw new AppException(ErrorCode.CATEGORY_HAS_TASKS);
        }

        categoryRepository.delete(category);
    }

    @Override
    public CategoryDTO getCategoryById(Long id, Long accountId) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        if (!category.getAccount().getId().equals(accountId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        return categoryConverter.toDTO(category);
    }

    @Override
    public PageResponse<CategoryDTO> getCategoriesByAccount(Long accountId, Pageable pageable) {
        Page<Category> categoryPage = categoryRepository.findByAccountId(accountId, pageable);
        return buildPageResponse(categoryPage);
    }

    @Override
    public List<CategoryDTO> getAllCategoriesByAccount(Long accountId) {
        List<Category> categories = categoryRepository.findByAccountId(accountId);
        return categories.stream()
                .map(categoryConverter::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PageResponse<CategoryDTO> searchCategories(Long accountId, String keyword, Pageable pageable) {
        Page<Category> categoryPage = categoryRepository.searchByAccountIdAndKeyword(accountId, keyword, pageable);
        return buildPageResponse(categoryPage);
    }

    @Override
    public long countCategoriesByAccount(Long accountId) {
        return categoryRepository.countByAccountId(accountId);
    }

    private PageResponse<CategoryDTO> buildPageResponse(Page<Category> categoryPage) {
        List<CategoryDTO> categoryDTOs = categoryPage.getContent().stream()
                .map(categoryConverter::toDTO)
                .collect(Collectors.toList());

        return PageResponse.<CategoryDTO>builder()
                .pageNo(categoryPage.getNumber())
                .pageSize(categoryPage.getSize())
                .totalPages((long) categoryPage.getTotalPages())
                .data(categoryDTOs)
                .build();
    }
}
