package az.schedule.backendservice.service.impl;

import az.schedule.backendservice.dto.request.notification.NotificationRequest;
import az.schedule.backendservice.entity.Task;
import az.schedule.backendservice.enums.NotificationType;
import az.schedule.backendservice.enums.TaskStatus;
import az.schedule.backendservice.repository.TaskRepository;
import az.schedule.backendservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskReminderService {

    private final TaskRepository taskRepository;
    private final NotificationService notificationService;
    private final TrendyMessageService trendyMessageService;

    @Scheduled(fixedRate = 60000)
    public void sendTaskReminders() {
        log.info("Running scheduled task: sendTaskReminders");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime reminderThreshold = now.plusMinutes(10);

        List<Task> tasksStartingSoon = taskRepository.findTasksStartingSoon(
                reminderThreshold,
                now,
                TaskStatus.TODO
        );

        for (Task task : tasksStartingSoon) {
            String trendyContent = trendyMessageService.getTrendyStartReminder(task.getTitle());
            createReminderNotification(
                    task,
                    NotificationType.TASK_REMINDER,
                    "Task starting soon",
                    trendyContent
            );
            task.setStartReminderSent(true);
            taskRepository.save(task);
        }

        List<TaskStatus> activeStatuses = List.of(TaskStatus.TODO, TaskStatus.IN_PROGRESS);
        List<Task> tasksEndingSoon = taskRepository.findTasksEndingSoon(
                reminderThreshold,
                now,
                activeStatuses
        );

        for (Task task : tasksEndingSoon) {
            String trendyContent = trendyMessageService.getTrendyEndReminder(task.getTitle());
            createReminderNotification(
                    task,
                    NotificationType.TASK_REMINDER,
                    "Task nearing deadline",
                    trendyContent
            );
            task.setEndReminderSent(true);
            taskRepository.save(task);
        }
    }

    private void createReminderNotification(Task task, NotificationType type, String title, String content) {
        NotificationRequest request = NotificationRequest.builder()
                .title(title)
                .content(content)
                .type(type)
                .targetAccountId(task.getAccount().getId())
                .build();

        try {
            notificationService.createNotification(request, task.getAccount().getId());
            log.info("Sent reminder for task ID: {}", task.getId());
        } catch (Exception e) {
            log.error("Failed to send reminder for task ID: {}", task.getId(), e);
        }
    }
}
