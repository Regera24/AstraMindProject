package az.schedule.backendservice.service;

import az.schedule.backendservice.dto.TaskDTO;
import az.schedule.backendservice.dto.request.task.AdvancedTaskFilterRequest;
import az.schedule.backendservice.dto.request.task.BulkTaskRequest;
import az.schedule.backendservice.dto.request.task.TaskRequest;
import az.schedule.backendservice.dto.response.BulkOperationResponse;
import az.schedule.backendservice.dto.response.PageResponse;
import az.schedule.backendservice.dto.response.TaskStatisticsResponse;
import az.schedule.backendservice.enums.Priority;
import az.schedule.backendservice.enums.TaskStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public interface TaskService {
    TaskDTO createTask(TaskRequest request, Long accountId);
    
    TaskDTO updateTask(Long id, TaskRequest request, Long accountId);
    
    void deleteTask(Long id, Long accountId);
    
    TaskDTO getTaskById(Long id, Long accountId);
    
    PageResponse<TaskDTO> getTasksByAccount(Long accountId, Pageable pageable);
    
    PageResponse<TaskDTO> getTasksByAccountAndStatus(Long accountId, TaskStatus status, Pageable pageable);
    
    PageResponse<TaskDTO> getTasksByAccountAndCategory(Long accountId, Long categoryId, Pageable pageable);
    
    PageResponse<TaskDTO> searchTasks(Long accountId, String keyword, Pageable pageable);
    
    List<TaskDTO> getTasksByDateRange(Long accountId, LocalDateTime start, LocalDateTime end);
    
    TaskStatisticsResponse getAccountTaskStatistics(Long accountId);
    
    TaskStatisticsResponse getCategoryTaskStatistics(Long categoryId);
    
    // Bulk operations
    BulkOperationResponse bulkDeleteTasks(List<Long> taskIds, Long accountId);
    
    BulkOperationResponse bulkUpdateTaskStatus(BulkTaskRequest request, Long accountId);
    
    // Advanced filtering
    PageResponse<TaskDTO> advancedFilterTasks(AdvancedTaskFilterRequest filterRequest, Long accountId, Pageable pageable);
    
    // Priority filtering
    PageResponse<TaskDTO> getTasksByAccountAndPriority(Long accountId, Priority priority, Pageable pageable);
    
    // Overdue tasks
    List<TaskDTO> getOverdueTasks(Long accountId);
    
    long countTasksByAccount(Long accountId);
    
    long countTasksByAccountAndStatus(Long accountId, TaskStatus status);
    
    // Week and Month view
    List<TaskDTO> getTasksByWeek(Long accountId, LocalDateTime weekStart);
    
    List<TaskDTO> getTasksByMonth(Long accountId, int year, int month);
}
