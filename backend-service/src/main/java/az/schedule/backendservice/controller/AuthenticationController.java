package az.schedule.backendservice.controller;

import az.schedule.backendservice.dto.request.authentication.*;
import az.schedule.backendservice.dto.response.ApiResponse;
import az.schedule.backendservice.dto.response.authentication.*;
import az.schedule.backendservice.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;

@Tag(name = "Authentication API", description = "Endpoints for authentication, registration, and account management")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    @Operation(
            summary = "User login",
            description = "Authenticate user with email/username and password, returns access token and sets refresh token in cookie"
    )
    @PostMapping("/login")
    public ApiResponse<AuthenticationResponse> login(
            @RequestBody @Valid AuthenticationRequest authenticationRequest, 
            HttpServletResponse response) {
        AuthenticationResponse authenticationResponse =
                authenticationService.authenticate(authenticationRequest, response);
        return ApiResponse.<AuthenticationResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Login successfully")
                .data(authenticationResponse)
                .build();
    }

    @Operation(
            summary = "Register new account",
            description = "Create a new user account with the provided information"
    )
    @PostMapping("/register")
    public ApiResponse<AccountCreationResponse> register(@RequestBody @Valid AccountCreationRequest request) {
        AccountCreationResponse response = authenticationService.createAccount(request);
        return ApiResponse.<AccountCreationResponse>builder()
                .message("Created account successfully")
                .code(HttpStatus.CREATED.value())
                .data(response)
                .build();
    }

    @Operation(
            summary = "Refresh access token",
            description = "Generate new access token using the refresh token from cookie"
    )
    @PostMapping("/refresh-token")
    public ApiResponse<AuthenticationResponse> refreshToken(HttpServletRequest request) {
        AuthenticationResponse authenticationResponse = authenticationService.refreshToken(request);
        return ApiResponse.<AuthenticationResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Refresh token successfully")
                .data(authenticationResponse)
                .build();
    }

    @Operation(
            summary = "Introspect token",
            description = "Validate and get information from a JWT token"
    )
    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspect(@RequestBody @Valid IntrospectRequest request)
            throws JOSEException, ParseException {
        IntrospectResponse response = authenticationService.introspect(request);
        return ApiResponse.<IntrospectResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Introspect token successfully")
                .data(response)
                .build();
    }

    @Operation(
            summary = "Check unique information",
            description = "Check if username, email, or phone number already exists"
    )
    @PostMapping("/check-unique")
    public ApiResponse<UniqueInformationCheckResponse> checkUniqueInformation(
            @RequestBody @Valid UniqueInformCheckRequest request) {
        UniqueInformationCheckResponse response = authenticationService.checkUniqueInformation(request);
        return ApiResponse.<UniqueInformationCheckResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Check unique information successfully")
                .data(response)
                .build();
    }

    @Operation(
            summary = "Send OTP",
            description = "Send OTP to email or phone number for password reset"
    )
    @PostMapping("/send-otp")
    public ApiResponse<SendOTPResponse> sendOTP(@RequestParam String key) {
        SendOTPResponse response = authenticationService.sendOTP(key);
        return ApiResponse.<SendOTPResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Send OTP successfully")
                .data(response)
                .build();
    }

    @Operation(
            summary = "Check OTP",
            description = "Verify OTP code for password reset"
    )
    @PostMapping("/check-otp")
    public ApiResponse<Boolean> checkOTP(@RequestBody @Valid OTPCheckRequest request) {
        boolean isValid = authenticationService.checkOTP(request);
        return ApiResponse.<Boolean>builder()
                .code(HttpStatus.OK.value())
                .message("Check OTP successfully")
                .data(isValid)
                .build();
    }

    @Operation(
            summary = "Change password",
            description = "Change user password after OTP verification"
    )
    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(@RequestBody @Valid ChangePasswordRequest request) {
        authenticationService.changePassword(request);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Change password successfully")
                .build();
    }

    @Operation(
            summary = "OAuth2 authentication",
            description = "Authenticate user using OAuth2 authorization code"
    )
    @PostMapping("/outbound/authentication")
    public ApiResponse<AuthenticationResponse> outboundAuthenticate(@RequestParam String code) {
        AuthenticationResponse response = authenticationService.outboundAuthenticate(code);
        return ApiResponse.<AuthenticationResponse>builder()
                .code(HttpStatus.OK.value())
                .message("OAuth2 authentication successfully")
                .data(response)
                .build();
    }
}
