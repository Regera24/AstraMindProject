package az.schedule.backendservice.converter;

import az.schedule.backendservice.dto.TaskDTO;
import az.schedule.backendservice.dto.request.task.TaskRequest;
import az.schedule.backendservice.entity.Account;
import az.schedule.backendservice.entity.Category;
import az.schedule.backendservice.entity.Task;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TaskConverter {
    private final ModelMapper modelMapper;

    public TaskDTO toDTO(Task task) {
        TaskDTO dto = modelMapper.map(task, TaskDTO.class);
        
        if (task.getCategory() != null) {
            dto.setCategoryId(task.getCategory().getId());
            dto.setCategoryName(task.getCategory().getName());
        }
        
        if (task.getAccount() != null) {
            dto.setAccountId(task.getAccount().getId());
            dto.setAccountUsername(task.getAccount().getUsername());
        }
        
        return dto;
    }

    public Task toEntity(TaskRequest request, Account account, Category category) {
        Task task = new Task();

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStartTime(request.getStartTime());
        task.setEndTime(request.getEndTime());
        task.setPriority(request.getPriority());
        task.setStatus(request.getStatus());
        task.setAccount(account);
        task.setCategory(category);

        return task;
    }

    public void updateEntity(Task task, TaskRequest request, Category category) {
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStartTime(request.getStartTime());
        task.setEndTime(request.getEndTime());
        task.setPriority(request.getPriority());
        task.setStatus(request.getStatus());
        task.setCategory(category);
    }
}
