package az.schedule.backendservice.entity;

import az.schedule.backendservice.enums.Priority;
import az.schedule.backendservice.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "Task")
public class Task extends BaseEntity{
    @Column(nullable = false)
    String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    @ManyToOne
    @JoinColumn(name = "CategoryID")
    Category category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status = TaskStatus.TODO;

    @ManyToOne
    @JoinColumn(name = "AccountID")
    Account account;

    @Column(name = "start_reminder_sent", columnDefinition = "BIT(1) DEFAULT 0")
    private boolean startReminderSent = false;

    @Column(name = "end_reminder_sent", columnDefinition = "BIT(1) DEFAULT 0")
    private boolean endReminderSent = false;
}
