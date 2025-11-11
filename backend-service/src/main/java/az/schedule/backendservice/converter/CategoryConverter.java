package az.schedule.backendservice.converter;

import az.schedule.backendservice.dto.CategoryDTO;
import az.schedule.backendservice.dto.request.category.CategoryRequest;
import az.schedule.backendservice.entity.Account;
import az.schedule.backendservice.entity.Category;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CategoryConverter {
    private final ModelMapper modelMapper;

    public CategoryDTO toDTO(Category category) {
        CategoryDTO dto = modelMapper.map(category, CategoryDTO.class);
        
        if (category.getAccount() != null) {
            dto.setAccountId(category.getAccount().getId());
            dto.setAccountUsername(category.getAccount().getUsername());
        }
        
        if (category.getTasks() != null) {
            dto.setTaskCount((long) category.getTasks().size());
        } else {
            dto.setTaskCount(0L);
        }
        
        return dto;
    }

    public Category toEntity(CategoryRequest request, Account account) {
        Category category = modelMapper.map(request, Category.class);
        category.setAccount(account);
        return category;
    }

    public void updateEntity(Category category, CategoryRequest request) {
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setColor(request.getColor());
    }
}
