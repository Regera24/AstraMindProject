package az.schedule.backendservice.service.impl;

import az.schedule.backendservice.converter.TaskConverter;
import az.schedule.backendservice.dto.TaskDTO;
import az.schedule.backendservice.dto.request.task.AdvancedTaskFilterRequest;
import az.schedule.backendservice.dto.request.task.BulkTaskRequest;
import az.schedule.backendservice.dto.request.task.TaskRequest;
import az.schedule.backendservice.dto.response.BulkOperationResponse;
import az.schedule.backendservice.dto.response.PageResponse;
import az.schedule.backendservice.dto.response.TaskStatisticsResponse;
import az.schedule.backendservice.entity.Account;
import az.schedule.backendservice.entity.Category;
import az.schedule.backendservice.entity.Task;
import az.schedule.backendservice.enums.Priority;
import az.schedule.backendservice.enums.TaskStatus;
import az.schedule.backendservice.exception.AppException;
import az.schedule.backendservice.exception.ErrorCode;
import az.schedule.backendservice.repository.AccountRepository;
import az.schedule.backendservice.repository.CategoryRepository;
import az.schedule.backendservice.repository.TaskRepository;
import az.schedule.backendservice.service.TaskService;
import az.schedule.backendservice.service.NotificationService;
import az.schedule.backendservice.dto.request.notification.NotificationRequest;
import az.schedule.backendservice.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {
    private final TaskRepository taskRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final TaskConverter taskConverter;
    private final NotificationService notificationService;
    private final TrendyMessageService trendyMessageService;

    @Override
    @Transactional
    public TaskDTO createTask(TaskRequest request, Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            
            if (!category.getAccount().getId().equals(accountId)) {
                throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
            }
        }

        Task task = taskConverter.toEntity(request, account, category);
        Task savedTask = taskRepository.save(task);
        return taskConverter.toDTO(savedTask);
    }

    @Override
    @Transactional
    public TaskDTO updateTask(Long id, TaskRequest request, Long accountId) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        if (!task.getAccount().getId().equals(accountId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            
            if (!category.getAccount().getId().equals(accountId)) {
                throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
            }
        }

        boolean wasNotDone = task.getStatus() != TaskStatus.DONE;
        boolean isNowDone = request.getStatus() == TaskStatus.DONE;
        
        taskConverter.updateEntity(task, request, category);
        Task updatedTask = taskRepository.save(task);
        
        if (wasNotDone && isNowDone) {
            sendTaskCompletionNotification(updatedTask, accountId);
        }
        
        return taskConverter.toDTO(updatedTask);
    }

    @Override
    @Transactional
    public void deleteTask(Long id, Long accountId) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        if (!task.getAccount().getId().equals(accountId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        taskRepository.delete(task);
    }

    @Override
    public TaskDTO getTaskById(Long id, Long accountId) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        if (!task.getAccount().getId().equals(accountId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        return taskConverter.toDTO(task);
    }

    @Override
    public PageResponse<TaskDTO> getTasksByAccount(Long accountId, Pageable pageable) {
        Page<Task> taskPage = taskRepository.findByAccountId(accountId, pageable);
        return buildPageResponse(taskPage);
    }

    @Override
    public PageResponse<TaskDTO> getTasksByAccountAndStatus(Long accountId, TaskStatus status, Pageable pageable) {
        Page<Task> taskPage = taskRepository.findByAccountIdAndStatus(accountId, status, pageable);
        return buildPageResponse(taskPage);
    }

    @Override
    public PageResponse<TaskDTO> getTasksByAccountAndCategory(Long accountId, Long categoryId, Pageable pageable) {
        Page<Task> taskPage = taskRepository.findByAccountIdAndCategoryId(accountId, categoryId, pageable);
        return buildPageResponse(taskPage);
    }

    @Override
    public PageResponse<TaskDTO> searchTasks(Long accountId, String keyword, Pageable pageable) {
        Page<Task> taskPage = taskRepository.searchByAccountIdAndKeyword(accountId, keyword, pageable);
        return buildPageResponse(taskPage);
    }

    @Override
    public List<TaskDTO> getTasksByDateRange(Long accountId, LocalDateTime start, LocalDateTime end) {
        List<Task> tasks = taskRepository.findByAccountIdAndStartTimeBetween(accountId, start, end);
        return tasks.stream()
                .map(taskConverter::toDTO)
                .toList();
    }

    @Override
    public TaskStatisticsResponse getAccountTaskStatistics(Long accountId) {
        long total = taskRepository.countByAccountId(accountId);
        long todo = taskRepository.countByAccountIdAndStatus(accountId, TaskStatus.TODO);
        long inProgress = taskRepository.countByAccountIdAndStatus(accountId, TaskStatus.IN_PROGRESS);
        long completed = taskRepository.countByAccountIdAndStatus(accountId, TaskStatus.DONE);
        long paused = taskRepository.countByAccountIdAndStatus(accountId, TaskStatus.PAUSED);
        long overdue = taskRepository.countByAccountIdAndEndTimeBeforeAndStatusNot(accountId, LocalDateTime.now(), TaskStatus.DONE);

        return TaskStatisticsResponse.builder()
                .totalTasks(total)
                .todoTasks(todo)
                .inProgressTasks(inProgress)
                .completedTasks(completed)
                .pausedTasks(paused)
                .overdueTasks(overdue)
                .build();
    }

    @Override
    public TaskStatisticsResponse getCategoryTaskStatistics(Long categoryId) {
        long total = taskRepository.countByCategoryId(categoryId);
        long todo = taskRepository.countByCategoryIdAndStatus(categoryId, TaskStatus.TODO);
        long inProgress = taskRepository.countByCategoryIdAndStatus(categoryId, TaskStatus.IN_PROGRESS);
        long completed = taskRepository.countByCategoryIdAndStatus(categoryId, TaskStatus.DONE);
        long paused = taskRepository.countByCategoryIdAndStatus(categoryId, TaskStatus.PAUSED);
        // Note: Overdue count for category would require a more complex query, setting to 0 for now
        long overdue = 0;

        return TaskStatisticsResponse.builder()
                .totalTasks(total)
                .todoTasks(todo)
                .inProgressTasks(inProgress)
                .completedTasks(completed)
                .pausedTasks(paused)
                .overdueTasks(overdue)
                .build();
    }

    @Override
    public long countTasksByAccount(Long accountId) {
        return taskRepository.countByAccountId(accountId);
    }

    @Override
    public long countTasksByAccountAndStatus(Long accountId, TaskStatus status) {
        return taskRepository.countByAccountIdAndStatus(accountId, status);
    }

    @Override
    @Transactional
    public BulkOperationResponse bulkDeleteTasks(List<Long> taskIds, Long accountId) {
        int successCount = 0;
        int failureCount = 0;

        for (Long taskId : taskIds) {
            try {
                Task task = taskRepository.findById(taskId)
                        .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

                if (!task.getAccount().getId().equals(accountId)) {
                    failureCount++;
                    continue;
                }

                taskRepository.delete(task);
                successCount++;
            } catch (Exception e) {
                failureCount++;
            }
        }

        return BulkOperationResponse.builder()
                .successCount(successCount)
                .failureCount(failureCount)
                .message(String.format("Deleted %d tasks successfully, %d failed", successCount, failureCount))
                .build();
    }

    @Override
    @Transactional
    public BulkOperationResponse bulkUpdateTaskStatus(BulkTaskRequest request, Long accountId) {
        int successCount = 0;
        int failureCount = 0;

        for (Long taskId : request.getTaskIds()) {
            try {
                Task task = taskRepository.findById(taskId)
                        .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

                if (!task.getAccount().getId().equals(accountId)) {
                    failureCount++;
                    continue;
                }

                task.setStatus(request.getStatus());
                taskRepository.save(task);
                successCount++;
            } catch (Exception e) {
                failureCount++;
            }
        }

        return BulkOperationResponse.builder()
                .successCount(successCount)
                .failureCount(failureCount)
                .message(String.format("Updated %d tasks successfully, %d failed", successCount, failureCount))
                .build();
    }

    @Override
    public PageResponse<TaskDTO> advancedFilterTasks(AdvancedTaskFilterRequest filterRequest, Long accountId, Pageable pageable) {
        // This would require a custom query or Specification
        // For now, implementing basic version with keyword search
        if (filterRequest.getKeyword() != null && !filterRequest.getKeyword().isEmpty()) {
            return searchTasks(accountId, filterRequest.getKeyword(), pageable);
        }
        return getTasksByAccount(accountId, pageable);
    }

    @Override
    public PageResponse<TaskDTO> getTasksByAccountAndPriority(Long accountId, Priority priority, Pageable pageable) {
        Page<Task> taskPage = taskRepository.findByAccountIdAndPriority(accountId, priority, pageable);
        return buildPageResponse(taskPage);
    }

    @Override
    public List<TaskDTO> getOverdueTasks(Long accountId) {
        List<Task> overdueTasks = taskRepository.findByAccountIdAndEndTimeBeforeAndStatusNot(
                accountId,
                LocalDateTime.now(),
                TaskStatus.DONE
        );
        return overdueTasks.stream()
                .map(taskConverter::toDTO)
                .toList();
    }

    @Override
    public List<TaskDTO> getTasksByWeek(Long accountId, LocalDateTime weekStart) {
        // Calculate week end (7 days from start)
        LocalDateTime weekEnd = weekStart.plusDays(7).minusSeconds(1);
        
        // Get all tasks that fall within or overlap with the week range
        List<Task> tasks = taskRepository.findByAccountIdAndStartTimeBetween(accountId, weekStart, weekEnd);
        
        return tasks.stream()
                .map(taskConverter::toDTO)
                .toList();
    }

    @Override
    public List<TaskDTO> getTasksByMonth(Long accountId, int year, int month) {
        // Calculate month start and end
        LocalDateTime monthStart = LocalDateTime.of(year, month, 1, 0, 0, 0);
        LocalDateTime monthEnd = monthStart.plusMonths(1).minusSeconds(1);
        
        // Get all tasks that fall within or overlap with the month range
        List<Task> tasks = taskRepository.findByAccountIdAndStartTimeBetween(accountId, monthStart, monthEnd);
        
        return tasks.stream()
                .map(taskConverter::toDTO)
                .toList();
    }

    private PageResponse<TaskDTO> buildPageResponse(Page<Task> taskPage) {
        List<TaskDTO> taskDTOs = taskPage.getContent().stream()
                .map(taskConverter::toDTO)
                .toList();

        return PageResponse.<TaskDTO>builder()
                .pageNo(taskPage.getNumber())
                .pageSize(taskPage.getSize())
                .totalPages((long) taskPage.getTotalPages())
                .data(taskDTOs)
                .build();
    }

    private void sendTaskCompletionNotification(Task task, Long accountId) {
        try {
            String message = trendyMessageService.getTrendyMotivation();
            
            NotificationRequest notificationRequest = NotificationRequest.builder()
                    .title("Task Completed!")
                    .content(message)
                    .type(NotificationType.TASK_COMPLETED)
                    .targetAccountId(accountId)
                    .build();
            
            notificationService.createNotification(notificationRequest, null);
        } catch (Exception e) {
            System.err.println("Failed to send completion notification: " + e.getMessage());
        }
    }
}
