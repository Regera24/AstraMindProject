package az.schedule.backendservice.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    USER_EXISTED(400, "User existed", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(400, "User not existed", HttpStatus.NOT_FOUND),
    PASSWORD_INVALID(400, "Password must be at least 10", HttpStatus.BAD_REQUEST),
    KEY_INVALID(400, "Key invalid", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(401, "Unauthorized", HttpStatus.UNAUTHORIZED),
    FORBIDDEN(403, "Forbidden", HttpStatus.FORBIDDEN),
    NOT_FOUND(404, "Not Found", HttpStatus.NOT_FOUND),
    UNCATEGORIZED(500, "Error not defined", HttpStatus.INTERNAL_SERVER_ERROR),
    PASSWORD_EXISTED(400, "Password already existed", HttpStatus.CONFLICT),
    EMAIL_EXISTED(400, "Email already existed", HttpStatus.CONFLICT),
    USERNAME_EXISTED(400, "Username already existed", HttpStatus.CONFLICT),
    OTP_INVALID(400, "OTP invalid", HttpStatus.CONFLICT),
    RESOURCE_NOT_FOUND(400, "Resource not found", HttpStatus.NOT_FOUND),
    PHONE_NUMBER_EXISTED(400, "Phone number already existed", HttpStatus.CONFLICT),
    TASK_NOT_FOUND(404, "Task not found", HttpStatus.NOT_FOUND),
    TASK_TITLE_EXISTED(409, "Task title already exists for this account", HttpStatus.CONFLICT),
    CATEGORY_NOT_FOUND(404, "Category not found", HttpStatus.NOT_FOUND),
    CATEGORY_NAME_EXISTED(409, "Category name already exists for this account", HttpStatus.CONFLICT),
    CATEGORY_HAS_TASKS(409, "Cannot delete category because it has associated tasks", HttpStatus.CONFLICT),
    NOTIFICATION_NOT_FOUND(404, "Notification not found", HttpStatus.NOT_FOUND),
    UNAUTHORIZED_ACCESS(403, "You are not authorized to access this resource", HttpStatus.FORBIDDEN),
    INVALID_CATEGORY_ID(400, "Invalid category ID", HttpStatus.BAD_REQUEST),
    ROLE_NOT_FOUND(404, "Role not found", HttpStatus.NOT_FOUND),
    SUBSCRIPTION_NOT_FOUND(404, "Subscription not found", HttpStatus.NOT_FOUND),
    ACCOUNT_NOT_FOUND(404, "Account not found", HttpStatus.NOT_FOUND),
    AI_PARSING_ERROR(500, "Failed to parse task from natural language", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_TASK_DATA(400, "Invalid task data extracted from prompt", HttpStatus.BAD_REQUEST),
    INVALID_IMAGE_FORMAT(400, "Invalid image format. Supported formats: JPG, PNG, JPEG", HttpStatus.BAD_REQUEST),
    IMAGE_TOO_LARGE(400, "Image file is too large. Maximum size is 10MB", HttpStatus.BAD_REQUEST),
    IMAGE_NOT_SCHEDULE_RELATED(400, "Image is not related to scheduling or tasks. Please upload a calendar, schedule, or task-related image", HttpStatus.BAD_REQUEST),
    IMAGE_PROCESSING_ERROR(500, "Failed to process image", HttpStatus.INTERNAL_SERVER_ERROR),
    OAUTH2_AUTHENTICATION_FAILED(401, "OAuth2 authentication failed", HttpStatus.UNAUTHORIZED),
    ACCOUNT_DISABLED(403, "Account is disabled", HttpStatus.FORBIDDEN),
    ;
    private final int code;
    private final String message;
    private final HttpStatusCode httpStatusCode;

    ErrorCode(int code, String message, HttpStatusCode httpStatusCode) {
        this.code = code;
        this.message = message;
        this.httpStatusCode = httpStatusCode;
    }
}
