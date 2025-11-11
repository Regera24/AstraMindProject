package az.schedule.backendservice.controller;

import az.schedule.backendservice.dto.request.authentication.*;
import az.schedule.backendservice.dto.response.authentication.*;
import az.schedule.backendservice.service.AuthenticationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthenticationController.class)
@AutoConfigureMockMvc(addFilters = false)
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthenticationController Unit Tests")
class AuthenticationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthenticationService authenticationService;

    @Autowired
    private ObjectMapper objectMapper;

    private AuthenticationRequest mockAuthRequest;
    private AuthenticationResponse mockAuthResponse;
    private AccountCreationRequest mockRegistrationRequest;
    private AccountCreationResponse mockRegistrationResponse;

    @BeforeEach
    void setUp() {
        mockAuthRequest = new AuthenticationRequest();
        mockAuthRequest.setUsername("testuser");
        mockAuthRequest.setPassword("password123");

        mockAuthResponse = AuthenticationResponse.builder()
                .token("mock-jwt-token")
                .success(true)
                .build();

        mockRegistrationRequest = new AccountCreationRequest();
        mockRegistrationRequest.setUsername("newuser");
        mockRegistrationRequest.setEmail("newuser@example.com");
        mockRegistrationRequest.setPassword("Password123!");
        mockRegistrationRequest.setFullName("New User");

        mockRegistrationResponse = AccountCreationResponse.builder()
                .accountID(1L)
                .username("newuser")
                .email("newuser@example.com")
                .build();
    }

    @Test
    @DisplayName("Should login successfully with valid credentials")
    void testLogin_Success() throws Exception {
        // Given
        when(authenticationService.authenticate(any(AuthenticationRequest.class), any(HttpServletResponse.class)))
                .thenReturn(mockAuthResponse);

        // When & Then
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mockAuthRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Login successfully"))
                .andExpect(jsonPath("$.data.accessToken").value("mock-jwt-token"))
                .andExpect(jsonPath("$.data.authenticated").value(true));

        verify(authenticationService, times(1)).authenticate(any(AuthenticationRequest.class), any(HttpServletResponse.class));
    }

    @Test
    @DisplayName("Should register new account successfully")
    void testRegister_Success() throws Exception {
        // Given
        when(authenticationService.createAccount(any(AccountCreationRequest.class)))
                .thenReturn(mockRegistrationResponse);

        // When & Then
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mockRegistrationRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(201))
                .andExpect(jsonPath("$.message").value("Created account successfully"))
                .andExpect(jsonPath("$.data.username").value("newuser"))
                .andExpect(jsonPath("$.data.email").value("newuser@example.com"));

        verify(authenticationService, times(1)).createAccount(any(AccountCreationRequest.class));
    }

    @Test
    @DisplayName("Should refresh token successfully")
    void testRefreshToken_Success() throws Exception {
        // Given
        when(authenticationService.refreshToken(any(HttpServletRequest.class)))
                .thenReturn(mockAuthResponse);

        // When & Then
        mockMvc.perform(post("/api/v1/auth/refresh-token")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Refresh token successfully"))
                .andExpect(jsonPath("$.data.accessToken").value("mock-jwt-token"));

        verify(authenticationService, times(1)).refreshToken(any(HttpServletRequest.class));
    }

    @Test
    @DisplayName("Should authenticate via OAuth2 successfully")
    void testOutboundAuthenticate_Success() throws Exception {
        // Given
        String authCode = "oauth2-auth-code";
        when(authenticationService.outboundAuthenticate(authCode)).thenReturn(mockAuthResponse);

        // When & Then
        mockMvc.perform(post("/api/v1/auth/outbound/authentication")
                        .param("code", authCode)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("OAuth2 authentication successfully"))
                .andExpect(jsonPath("$.data.accessToken").value("mock-jwt-token"));

        verify(authenticationService, times(1)).outboundAuthenticate(authCode);
    }

    @Test
    @DisplayName("Should handle authentication failure")
    void testLogin_InvalidCredentials() throws Exception {
        // Given
        when(authenticationService.authenticate(any(AuthenticationRequest.class), any(HttpServletResponse.class)))
                .thenThrow(new RuntimeException("Invalid credentials"));

        // When & Then
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mockAuthRequest)))
                .andExpect(status().is5xxServerError());

        verify(authenticationService, times(1)).authenticate(any(AuthenticationRequest.class), any(HttpServletResponse.class));
    }

    @Test
    @DisplayName("Should handle duplicate registration")
    void testRegister_DuplicateUser() throws Exception {
        // Given
        when(authenticationService.createAccount(any(AccountCreationRequest.class)))
                .thenThrow(new RuntimeException("Username already exists"));

        // When & Then
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mockRegistrationRequest)))
                .andExpect(status().is5xxServerError());

        verify(authenticationService, times(1)).createAccount(any(AccountCreationRequest.class));
    }

    @Test
    @DisplayName("Should handle expired refresh token")
    void testRefreshToken_ExpiredToken() throws Exception {
        // Given
        when(authenticationService.refreshToken(any(HttpServletRequest.class)))
                .thenThrow(new RuntimeException("Refresh token expired"));

        // When & Then
        mockMvc.perform(post("/api/v1/auth/refresh-token")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().is5xxServerError());

        verify(authenticationService, times(1)).refreshToken(any(HttpServletRequest.class));
    }

    @Test
    @DisplayName("Should handle OTP send failure")
    void testSendOTP_Failure() throws Exception {
        // Given
        String email = "invalid@example.com";
        when(authenticationService.sendOTP(email))
                .thenThrow(new RuntimeException("Email not found"));

        // When & Then
        mockMvc.perform(post("/api/v1/auth/send-otp")
                        .param("key", email)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().is5xxServerError());

        verify(authenticationService, times(1)).sendOTP(email);
    }
}
