package az.schedule.backendservice.exception;

import az.schedule.backendservice.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.io.EOFException;
import java.text.ParseException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> hanldeRuntimeException(RuntimeException e) {
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setMessage(e.getMessage());
        apiResponse.setCode(400);
        return ResponseEntity.status(400).body(apiResponse);
    }

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> hanldeAppException(AppException e) {
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setMessage(e.getErrorCode().getMessage());
        apiResponse.setCode(e.getErrorCode().getCode());
        return ResponseEntity.status(e.getErrorCode().getHttpStatusCode()).body(apiResponse);
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
