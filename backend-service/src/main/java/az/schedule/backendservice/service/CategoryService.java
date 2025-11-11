package az.schedule.backendservice.service;

import az.schedule.backendservice.dto.CategoryDTO;
import az.schedule.backendservice.dto.request.category.CategoryRequest;
import az.schedule.backendservice.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface CategoryService {
    CategoryDTO createCategory(CategoryRequest request, Long accountId);
    
    CategoryDTO updateCategory(Long id, CategoryRequest request, Long accountId);
    
    void deleteCategory(Long id, Long accountId);
    
    CategoryDTO getCategoryById(Long id, Long accountId);
    
    PageResponse<CategoryDTO> getCategoriesByAccount(Long accountId, Pageable pageable);
    
    List<CategoryDTO> getAllCategoriesByAccount(Long accountId);
    
    PageResponse<CategoryDTO> searchCategories(Long accountId, String keyword, Pageable pageable);
    
    long countCategoriesByAccount(Long accountId);
}
