package az.schedule.backendservice.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum NotificationType {
    TASK_CREATED("Task Created", "A new task has been created.", "📝", "#2196F3"),
    TASK_UPDATED("Task Updated", "A task has been updated.", "✏️", "#FFC107"),
    TASK_DELETED("Task Deleted", "A task has been deleted.", "🗑️", "#F44336"),
    TASK_COMPLETED("Task Completed!", "Great job! Keep up the excellent work! 🎉", "✅", "#4CAF50"),
    TASK_REMINDER("Task Reminder", "You have an upcoming task.", "⏰", "#9C27B0"),

    SYSTEM_ANNOUNCEMENT("System Announcement", "A new system announcement is available.", "📢", "#607D8B"),
    PAYMENT_SUCCESS("Payment Success", "Your payment was successful.", "💰", "#4CAF50"),
    PAYMENT_FAILED("Payment Failed", "Your payment could not be processed.", "💳", "#F44336"),
    ACCOUNT_WARNING("Account Warning", "Please check your account status.", "⚠️", "#FF9800"),
    FEATURE_UPDATE("Feature Update", "New features are now available!", "🚀", "#673AB7"),

    AI_SUGGESTION("AI Suggestion", "An AI suggestion is ready for you.", "🤖", "#00ACC1"),
    DAILY_SUMMARY("Daily Summary", "Here's your daily activity summary.", "📊", "#9C27B0"),
    WEEKLY_REPORT("Weekly Report", "Your weekly performance report is ready.", "📈", "#3F51B5");

    private final String title;
    private final String defaultMessage;
    private final String icon;
    private final String color;
}
