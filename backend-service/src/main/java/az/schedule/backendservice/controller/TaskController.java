package az.schedule.backendservice.controller;

import az.schedule.backendservice.dto.TaskDTO;
import az.schedule.backendservice.dto.request.task.AdvancedTaskFilterRequest;
import az.schedule.backendservice.dto.request.task.BulkTaskRequest;
import az.schedule.backendservice.dto.request.task.NaturalLanguageTaskRequest;
import az.schedule.backendservice.dto.request.task.TaskRequest;
import az.schedule.backendservice.dto.response.ParsedTaskResponse;
import az.schedule.backendservice.dto.response.ImageTaskParseResponse;
import az.schedule.backendservice.dto.response.ApiResponse;
import az.schedule.backendservice.dto.response.BulkOperationResponse;
import az.schedule.backendservice.dto.response.PageResponse;
import az.schedule.backendservice.dto.response.TaskStatisticsResponse;
import az.schedule.backendservice.dto.response.ScheduleSuggestionResponse;
import az.schedule.backendservice.enums.Priority;
import az.schedule.backendservice.enums.TaskStatus;
import az.schedule.backendservice.repository.AccountRepository;
import az.schedule.backendservice.repository.RoleRepository;
import az.schedule.backendservice.service.AIScheduleService;
import az.schedule.backendservice.service.AITaskService;
import az.schedule.backendservice.service.TaskService;
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
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Tag(name = "Task API", description = "Endpoints for managing tasks")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/tasks")
public class TaskController {
    private final TaskService taskService;
    private final AITaskService aiTaskService;
    private final AIScheduleService aiScheduleService;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AccountRepository accountRepository;

    @Operation(summary = "Create a new task", description = "Create a new task for the current user")
    @PostMapping
    public ApiResponse<TaskDTO> createTask(@Valid @RequestBody TaskRequest request) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        TaskDTO task = taskService.createTask(request, accountId);

        return ApiResponse.<TaskDTO>builder()
                .code(HttpStatus.CREATED.value())
                .message("Create task successfully")
                .data(task)
                .build();
    }

    @Operation(summary = "Update a task", description = "Update an existing task")
    @PutMapping("/{id}")
    public ApiResponse<TaskDTO> updateTask(
            @Parameter(description = "Task ID") @PathVariable Long id,
            @Valid @RequestBody TaskRequest request) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        TaskDTO task = taskService.updateTask(id, request, accountId);
        return ApiResponse.<TaskDTO>builder()
                .code(HttpStatus.OK.value())
                .message("Update task successfully")
                .data(task)
                .build();
    }

    @Operation(summary = "Delete a task", description = "Delete a task by its ID")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteTask(@Parameter(description = "Task ID") @PathVariable Long id) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        taskService.deleteTask(id, accountId);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Delete task successfully")
                .build();
    }

    @Operation(summary = "Get task by ID", description = "Retrieve a specific task by its ID")
    @GetMapping("/{id}")
    public ApiResponse<TaskDTO> getTaskById(@Parameter(description = "Task ID") @PathVariable Long id) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        TaskDTO task = taskService.getTaskById(id, accountId);
        return ApiResponse.<TaskDTO>builder()
                .code(HttpStatus.OK.value())
                .message("Get task successfully")
                .data(task)
                .build();
    }

    @Operation(summary = "Get all tasks", description = "Get all tasks for the current user with pagination")
    @GetMapping
    public ApiResponse<PageResponse<TaskDTO>> getTasks(
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int pageNo,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "id") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDir) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        Sort sort = SortUtils.getSortOrder(sortDir, sortBy);
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        
        PageResponse<TaskDTO> tasks = taskService.getTasksByAccount(accountId, pageable);
        return ApiResponse.<PageResponse<TaskDTO>>builder()
                .code(HttpStatus.OK.value())
                .message("Get tasks successfully")
                .data(tasks)
                .build();
    }

    @Operation(summary = "Get tasks by status", description = "Get tasks filtered by status")
    @GetMapping("/status/{status}")
    public ApiResponse<PageResponse<TaskDTO>> getTasksByStatus(
            @Parameter(description = "Task status") @PathVariable TaskStatus status,
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int pageNo,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "id") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDir) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        Sort sort = SortUtils.getSortOrder(sortDir, sortBy);
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        
        PageResponse<TaskDTO> tasks = taskService.getTasksByAccountAndStatus(accountId, status, pageable);
        return ApiResponse.<PageResponse<TaskDTO>>builder()
                .code(HttpStatus.OK.value())
                .message("Get tasks by status successfully")
                .data(tasks)
                .build();
    }

    @Operation(summary = "Get tasks by category", description = "Get tasks filtered by category")
    @GetMapping("/category/{categoryId}")
    public ApiResponse<PageResponse<TaskDTO>> getTasksByCategory(
            @Parameter(description = "Category ID") @PathVariable Long categoryId,
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int pageNo,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "id") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDir) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        Sort sort = SortUtils.getSortOrder(sortDir, sortBy);
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        
        PageResponse<TaskDTO> tasks = taskService.getTasksByAccountAndCategory(accountId, categoryId, pageable);
        return ApiResponse.<PageResponse<TaskDTO>>builder()
                .code(HttpStatus.OK.value())
                .message("Get tasks by category successfully")
                .data(tasks)
                .build();
    }

    @Operation(summary = "Search tasks", description = "Search tasks by keyword")
    @GetMapping("/search")
    public ApiResponse<PageResponse<TaskDTO>> searchTasks(
            @Parameter(description = "Search keyword") @RequestParam String keyword,
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int pageNo,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "id") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDir) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        Sort sort = SortUtils.getSortOrder(sortDir, sortBy);
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        
        PageResponse<TaskDTO> tasks = taskService.searchTasks(accountId, keyword, pageable);
        return ApiResponse.<PageResponse<TaskDTO>>builder()
                .code(HttpStatus.OK.value())
                .message("Search tasks successfully")
                .data(tasks)
                .build();
    }

    @Operation(summary = "Get tasks by date range", description = "Get tasks within a specific date range")
    @GetMapping("/date-range")
    public ApiResponse<List<TaskDTO>> getTasksByDateRange(
            @Parameter(description = "Start date time") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @Parameter(description = "End date time") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        List<TaskDTO> tasks = taskService.getTasksByDateRange(accountId, start, end);
        return ApiResponse.<List<TaskDTO>>builder()
                .code(HttpStatus.OK.value())
                .message("Get tasks by date range successfully")
                .data(tasks)
                .build();
    }

    @Operation(summary = "Get task statistics", description = "Get task statistics for the current user")
    @GetMapping("/statistics")
    public ApiResponse<TaskStatisticsResponse> getTaskStatistics() {
        Long accountId = SecurityUtils.getCurrentAccountId();
        TaskStatisticsResponse statistics = taskService.getAccountTaskStatistics(accountId);
        return ApiResponse.<TaskStatisticsResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get task statistics successfully")
                .data(statistics)
                .build();
    }

    @Operation(summary = "Get category task statistics", description = "Get task statistics for a specific category")
    @GetMapping("/statistics/category/{categoryId}")
    public ApiResponse<TaskStatisticsResponse> getCategoryTaskStatistics(
            @Parameter(description = "Category ID") @PathVariable Long categoryId) {
        TaskStatisticsResponse statistics = taskService.getCategoryTaskStatistics(categoryId);
        return ApiResponse.<TaskStatisticsResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get category task statistics successfully")
                .data(statistics)
                .build();
    }

    @Operation(summary = "Bulk delete tasks", description = "Delete multiple tasks at once")
    @DeleteMapping("/bulk")
    public ApiResponse<BulkOperationResponse> bulkDeleteTasks(@RequestBody List<Long> taskIds) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        BulkOperationResponse response = taskService.bulkDeleteTasks(taskIds, accountId);
        return ApiResponse.<BulkOperationResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Bulk delete completed")
                .data(response)
                .build();
    }

    @Operation(summary = "Bulk update task status", description = "Update status for multiple tasks at once")
    @PostMapping("/bulk/status")
    public ApiResponse<BulkOperationResponse> bulkUpdateTaskStatus(@Valid @RequestBody BulkTaskRequest request) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        BulkOperationResponse response = taskService.bulkUpdateTaskStatus(request, accountId);
        return ApiResponse.<BulkOperationResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Bulk update completed")
                .data(response)
                .build();
    }

    @Operation(summary = "Get tasks by priority", description = "Get tasks filtered by priority level")
    @GetMapping("/priority/{priority}")
    public ApiResponse<PageResponse<TaskDTO>> getTasksByPriority(
            @Parameter(description = "Task priority") @PathVariable Priority priority,
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int pageNo,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "id") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDir) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        Sort sort = SortUtils.getSortOrder(sortDir, sortBy);
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        
        PageResponse<TaskDTO> tasks = taskService.getTasksByAccountAndPriority(accountId, priority, pageable);
        return ApiResponse.<PageResponse<TaskDTO>>builder()
                .code(HttpStatus.OK.value())
                .message("Get tasks by priority successfully")
                .data(tasks)
                .build();
    }

    @Operation(summary = "Get overdue tasks", description = "Get all overdue tasks for the current user")
    @GetMapping("/overdue")
    public ApiResponse<List<TaskDTO>> getOverdueTasks() {
        Long accountId = SecurityUtils.getCurrentAccountId();
        List<TaskDTO> tasks = taskService.getOverdueTasks(accountId);
        return ApiResponse.<List<TaskDTO>>builder()
                .code(HttpStatus.OK.value())
                .message("Get overdue tasks successfully")
                .data(tasks)
                .build();
    }

    @Operation(summary = "Advanced filter tasks", description = "Filter tasks by multiple criteria")
    @PostMapping("/filter")
    public ApiResponse<PageResponse<TaskDTO>> advancedFilterTasks(
            @Valid @RequestBody AdvancedTaskFilterRequest filterRequest,
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int pageNo,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "id") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDir) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        Sort sort = SortUtils.getSortOrder(sortDir, sortBy);
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        
        PageResponse<TaskDTO> tasks = taskService.advancedFilterTasks(filterRequest, accountId, pageable);
        return ApiResponse.<PageResponse<TaskDTO>>builder()
                .code(HttpStatus.OK.value())
                .message("Filter tasks successfully")
                .data(tasks)
                .build();
    }

    @Operation(summary = "Get tasks by week", description = "Get all tasks for a specific week")
    @GetMapping("/week")
    public ApiResponse<List<TaskDTO>> getTasksByWeek(
            @Parameter(description = "Week start date time (ISO format)") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime weekStart) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        List<TaskDTO> tasks = taskService.getTasksByWeek(accountId, weekStart);
        return ApiResponse.<List<TaskDTO>>builder()
                .code(HttpStatus.OK.value())
                .message("Get tasks by week successfully")
                .data(tasks)
                .build();
    }

    @Operation(summary = "Get tasks by month", description = "Get all tasks for a specific month")
    @GetMapping("/month")
    public ApiResponse<List<TaskDTO>> getTasksByMonth(
            @Parameter(description = "Year") @RequestParam int year,
            @Parameter(description = "Month (1-12)") @RequestParam int month) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        List<TaskDTO> tasks = taskService.getTasksByMonth(accountId, year, month);
        return ApiResponse.<List<TaskDTO>>builder()
                .code(HttpStatus.OK.value())
                .message("Get tasks by month successfully")
                .data(tasks)
                .build();
    }

    @Operation(summary = "Parse task from natural language", description = "Parse natural language input into structured task data")
    @PostMapping("/ai/parse")
    public ApiResponse<ParsedTaskResponse> parseTaskFromNaturalLanguage(
            @Valid @RequestBody NaturalLanguageTaskRequest request) {
        ParsedTaskResponse parsedTask = aiTaskService.parseTaskFromNaturalLanguage(request);
        return ApiResponse.<ParsedTaskResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Task parsed successfully from natural language")
                .data(parsedTask)
                .build();
    }

    @Operation(summary = "Create task from natural language", description = "Create a task directly from natural language input")
    @PostMapping("/ai/create")
    public ApiResponse<TaskDTO> createTaskFromNaturalLanguage(
            @Valid @RequestBody NaturalLanguageTaskRequest request) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        TaskDTO task = aiTaskService.createTaskFromNaturalLanguage(request, accountId);
        return ApiResponse.<TaskDTO>builder()
                .code(HttpStatus.CREATED.value())
                .message("Task created successfully from natural language")
                .data(task)
                .build();
    }

    @Operation(summary = "Parse tasks from image", description = "Analyze an image to extract task information")
    @PostMapping(value = "/ai/parse-image", consumes = "multipart/form-data")
    public ApiResponse<ImageTaskParseResponse> parseTasksFromImage(
            @Parameter(description = "Image file (calendar, schedule, email, etc.)")
            @RequestParam("image") MultipartFile image,
            @Parameter(description = "Optional additional context")
            @RequestParam(value = "context", required = false) String context) {
        ImageTaskParseResponse response = aiTaskService.parseTasksFromImage(image, context);
        return ApiResponse.<ImageTaskParseResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Image analyzed successfully")
                .data(response)
                .build();
    }

    @Operation(summary = "Create tasks from image", description = "Extract and create tasks directly from an uploaded image")
    @PostMapping(value = "/ai/create-from-image", consumes = "multipart/form-data")
    public ApiResponse<List<TaskDTO>> createTasksFromImage(
            @Parameter(description = "Image file (calendar, schedule, email, etc.)")
            @RequestParam("image") MultipartFile image,
            @Parameter(description = "Optional additional context")
            @RequestParam(value = "context", required = false) String context) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        List<TaskDTO> tasks = aiTaskService.createTasksFromImage(image, context, accountId);
        return ApiResponse.<List<TaskDTO>>builder()
                .code(HttpStatus.CREATED.value())
                .message(String.format("Successfully created %d task(s) from image", tasks.size()))
                .data(tasks)
                .build();
    }

    @Operation(summary = "Get AI schedule suggestions", description = "Get AI-powered schedule optimization suggestions for a specific month")
    @GetMapping("/ai/schedule-suggestions")
    public ApiResponse<ScheduleSuggestionResponse> getScheduleSuggestions(
            @Parameter(description = "Year") @RequestParam int year,
            @Parameter(description = "Month (1-12)") @RequestParam int month) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        ScheduleSuggestionResponse suggestions = aiScheduleService.generateScheduleSuggestions(accountId, year, month);
        return ApiResponse.<ScheduleSuggestionResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Schedule suggestions generated successfully")
                .data(suggestions)
                .build();
    }
}
