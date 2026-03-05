package az.schedule.backendservice.exception;

import az.schedule.backendservice.dto.SubscriptionDTO;
import az.schedule.backendservice.dto.response.ApiResponse;
import az.schedule.backendservice.dto.response.SubscriptionRequiredResponse;
import az.schedule.backendservice.service.SubscriptionService;
import az.schedule.backendservice.utils.MessageUtils;
import az.schedule.backendservice.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.io.EOFException;
import java.text.ParseException;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final MessageUtils messageUtils;
    private final SubscriptionService subscriptionService;

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> hanldeRuntimeException(RuntimeException e) {
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setMessage(e.getMessage());
        apiResponse.setCode(400);
        return ResponseEntity.status(400).body(apiResponse);
    }

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<?>> hanldeAppException(AppException e) {
        // Special handling for SUBSCRIPTION_REQUIRED
        if (e.getErrorCode() == ErrorCode.SUBSCRIPTION_REQUIRED) {
            Long accountId = SecurityUtils.getCurrentAccountId();
            String paymentUrl = subscriptionService.getSubscriptionPaymentUrl(accountId);
            SubscriptionDTO subscription = subscriptionService.getAccountSubscription(accountId);
            
            SubscriptionRequiredResponse subscriptionResponse = SubscriptionRequiredResponse.builder()
                    .message(messageUtils.getMessage(e.getErrorCode().getMessageKey()))
                    .paymentUrl(paymentUrl)
                    .hasSubscription(false)
                    .subscription(subscription)
                    .build();
            
            ApiResponse<SubscriptionRequiredResponse> apiResponse = new ApiResponse<>();
            apiResponse.setMessage(messageUtils.getMessage(e.getErrorCode().getMessageKey()));
            apiResponse.setCode(e.getErrorCode().getCode());
            apiResponse.setData(subscriptionResponse);
            return ResponseEntity.status(e.getErrorCode().getHttpStatusCode()).body(apiResponse);
        }
        
        // Default handling for other exceptions
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        String localizedMessage = messageUtils.getMessage(e.getErrorCode().getMessageKey());
        apiResponse.setMessage(localizedMessage);
        apiResponse.setCode(e.getErrorCode().getCode());
        return ResponseEntity.status(e.getErrorCode().getHttpStatusCode()).body(apiResponse);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            String fieldName = error.getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ApiResponse<Map<String, String>> apiResponse = new ApiResponse<>();
        apiResponse.setMessage(messageUtils.getMessage("error.validation.failed"));
        apiResponse.setCode(400);
        apiResponse.setData(errors);
        return ResponseEntity.status(400).body(apiResponse);
    }

    @ExceptionHandler(ParseException.class)
    public ResponseEntity<ApiResponse<Void>> hanldeParseException(ParseException e) {
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setMessage(e.getMessage());
        apiResponse.setCode(400);
        return ResponseEntity.status(400).body(apiResponse);
    }

    @ExceptionHandler(EOFException.class)
    public ResponseEntity<ApiResponse<Void>> hanldeEOFException(EOFException e) {
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setMessage(e.getMessage());
        apiResponse.setCode(400);
        return ResponseEntity.status(400).body(apiResponse);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> hanldeAuthenticationException(AuthenticationException e) {
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setMessage(e.getMessage());
        apiResponse.setCode(401);
        return ResponseEntity.status(401).body(apiResponse);
    }

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ApiResponse<Void>> hanldeJwtException(JwtException e) {
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setMessage(e.getMessage());
        apiResponse.setCode(401);
        return ResponseEntity.status(401).body(apiResponse);
    }

}
