package az.schedule.backendservice.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    USER_EXISTED(400, "error.user.existed", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(400, "error.user.not.existed", HttpStatus.NOT_FOUND),
    PASSWORD_INVALID(400, "error.password.invalid", HttpStatus.BAD_REQUEST),
    KEY_INVALID(400, "error.key.invalid", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(401, "error.unauthorized", HttpStatus.UNAUTHORIZED),
    FORBIDDEN(403, "error.forbidden", HttpStatus.FORBIDDEN),
    NOT_FOUND(404, "error.not.found", HttpStatus.NOT_FOUND),
    UNCATEGORIZED(500, "error.uncategorized", HttpStatus.INTERNAL_SERVER_ERROR),
    PASSWORD_EXISTED(400, "error.password.existed", HttpStatus.CONFLICT),
    EMAIL_EXISTED(400, "error.email.existed", HttpStatus.CONFLICT),
    USERNAME_EXISTED(400, "error.username.existed", HttpStatus.CONFLICT),
    OTP_INVALID(400, "error.otp.invalid", HttpStatus.CONFLICT),
    RESOURCE_NOT_FOUND(400, "error.resource.not.found", HttpStatus.NOT_FOUND),
    PHONE_NUMBER_EXISTED(400, "error.phone.number.existed", HttpStatus.CONFLICT),
    TASK_NOT_FOUND(404, "error.task.not.found", HttpStatus.NOT_FOUND),
    TASK_TITLE_EXISTED(409, "error.task.title.existed", HttpStatus.CONFLICT),
    CATEGORY_NOT_FOUND(404, "error.category.not.found", HttpStatus.NOT_FOUND),
    CATEGORY_NAME_EXISTED(409, "error.category.name.existed", HttpStatus.CONFLICT),
    CATEGORY_HAS_TASKS(409, "error.category.has.tasks", HttpStatus.CONFLICT),
    NOTIFICATION_NOT_FOUND(404, "error.notification.not.found", HttpStatus.NOT_FOUND),
    UNAUTHORIZED_ACCESS(403, "error.unauthorized.access", HttpStatus.FORBIDDEN),
    INVALID_CATEGORY_ID(400, "error.invalid.category.id", HttpStatus.BAD_REQUEST),
    ROLE_NOT_FOUND(404, "error.role.not.found", HttpStatus.NOT_FOUND),
    SUBSCRIPTION_NOT_FOUND(404, "error.subscription.not.found", HttpStatus.NOT_FOUND),
    ACCOUNT_NOT_FOUND(404, "error.account.not.found", HttpStatus.NOT_FOUND),
    AI_PARSING_ERROR(500, "error.ai.parsing.error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_TASK_DATA(400, "error.invalid.task.data", HttpStatus.BAD_REQUEST),
    INVALID_IMAGE_FORMAT(400, "error.invalid.image.format", HttpStatus.BAD_REQUEST),
    IMAGE_TOO_LARGE(400, "error.image.too.large", HttpStatus.BAD_REQUEST),
    IMAGE_NOT_SCHEDULE_RELATED(400, "error.image.not.schedule.related", HttpStatus.BAD_REQUEST),
    IMAGE_PROCESSING_ERROR(500, "error.image.processing.error", HttpStatus.INTERNAL_SERVER_ERROR),
    OAUTH2_AUTHENTICATION_FAILED(401, "error.oauth2.authentication.failed", HttpStatus.UNAUTHORIZED),
    ACCOUNT_DISABLED(403, "error.account.disabled", HttpStatus.FORBIDDEN),
    SUBSCRIPTION_REQUIRED(402, "error.subscription.required", HttpStatus.PAYMENT_REQUIRED),
    ;
    private final int code;
    private final String messageKey;
    private final HttpStatusCode httpStatusCode;

    ErrorCode(int code, String messageKey, HttpStatusCode httpStatusCode) {
        this.code = code;
        this.messageKey = messageKey;
        this.httpStatusCode = httpStatusCode;
    }
    
    // For backward compatibility
    public String getMessage() {
        return messageKey;
    }
}
