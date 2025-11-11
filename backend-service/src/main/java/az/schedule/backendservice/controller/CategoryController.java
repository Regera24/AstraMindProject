package az.schedule.backendservice.controller;

import az.schedule.backendservice.dto.CategoryDTO;
import az.schedule.backendservice.dto.request.category.CategoryRequest;
import az.schedule.backendservice.dto.response.ApiResponse;
import az.schedule.backendservice.dto.response.PageResponse;
import az.schedule.backendservice.service.CategoryService;
import az.schedule.backendservice.utils.SecurityUtils;
import az.schedule.backendservice.utils.SortUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Category API", description = "Endpoints for managing categories")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/categories")
public class CategoryController {
    private final CategoryService categoryService;

    @Operation(summary = "Create a new category", description = "Create a new category for the current user")
    @PostMapping
    public ApiResponse<CategoryDTO> createCategory(@Valid @RequestBody CategoryRequest request) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        CategoryDTO category = categoryService.createCategory(request, accountId);
        return ApiResponse.<CategoryDTO>builder()
                .code(HttpStatus.CREATED.value())
                .message("Create category successfully")
                .data(category)
                .build();
    }

    @Operation(summary = "Update a category", description = "Update an existing category")
    @PutMapping("/{id}")
    public ApiResponse<CategoryDTO> updateCategory(
            @Parameter(description = "Category ID") @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        CategoryDTO category = categoryService.updateCategory(id, request, accountId);
        return ApiResponse.<CategoryDTO>builder()
                .code(HttpStatus.OK.value())
                .message("Update category successfully")
                .data(category)
                .build();
    }

    @Operation(summary = "Delete a category", description = "Delete a category by its ID")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCategory(@Parameter(description = "Category ID") @PathVariable Long id) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        categoryService.deleteCategory(id, accountId);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Delete category successfully")
                .build();
    }

    @Operation(summary = "Get category by ID", description = "Retrieve a specific category by its ID")
    @GetMapping("/{id}")
    public ApiResponse<CategoryDTO> getCategoryById(@Parameter(description = "Category ID") @PathVariable Long id) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        CategoryDTO category = categoryService.getCategoryById(id, accountId);
        return ApiResponse.<CategoryDTO>builder()
                .code(HttpStatus.OK.value())
                .message("Get category successfully")
                .data(category)
                .build();
    }

    @Operation(summary = "Get all categories", description = "Get all categories for the current user with pagination")
    @GetMapping
    public ApiResponse<PageResponse<CategoryDTO>> getCategories(
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int pageNo,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "id") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDir) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        Sort sort = SortUtils.getSortOrder(sortDir, sortBy);
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        
        PageResponse<CategoryDTO> categories = categoryService.getCategoriesByAccount(accountId, pageable);
        return ApiResponse.<PageResponse<CategoryDTO>>builder()
                .code(HttpStatus.OK.value())
                .message("Get categories successfully")
                .data(categories)
                .build();
    }

    @Operation(summary = "Get all categories (no pagination)", description = "Get all categories for the current user without pagination")
    @GetMapping("/all")
    public ApiResponse<List<CategoryDTO>> getAllCategories() {
        Long accountId = SecurityUtils.getCurrentAccountId();
        List<CategoryDTO> categories = categoryService.getAllCategoriesByAccount(accountId);
        return ApiResponse.<List<CategoryDTO>>builder()
                .code(HttpStatus.OK.value())
                .message("Get all categories successfully")
                .data(categories)
                .build();
    }

    @Operation(summary = "Search categories", description = "Search categories by keyword")
    @GetMapping("/search")
    public ApiResponse<PageResponse<CategoryDTO>> searchCategories(
            @Parameter(description = "Search keyword") @RequestParam String keyword,
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int pageNo,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "id") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDir) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        Sort sort = SortUtils.getSortOrder(sortDir, sortBy);
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        
        PageResponse<CategoryDTO> categories = categoryService.searchCategories(accountId, keyword, pageable);
        return ApiResponse.<PageResponse<CategoryDTO>>builder()
                .code(HttpStatus.OK.value())
                .message("Search categories successfully")
                .data(categories)
                .build();
    }
}
