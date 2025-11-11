package az.schedule.backendservice.service.impl;

import az.schedule.backendservice.client.GoogleUserInfoClient;
import az.schedule.backendservice.client.OutboundGoogleClient;
import az.schedule.backendservice.converter.AccountConverter;
import az.schedule.backendservice.dto.request.authentication.*;
import az.schedule.backendservice.dto.response.authentication.*;
import az.schedule.backendservice.entity.Account;
import az.schedule.backendservice.entity.Role;
import az.schedule.backendservice.enums.TokenType;
import az.schedule.backendservice.exception.AppException;
import az.schedule.backendservice.exception.ErrorCode;
import az.schedule.backendservice.repository.AccountRepository;
import az.schedule.backendservice.repository.RoleRepository;
import az.schedule.backendservice.service.AuthenticationService;
import az.schedule.backendservice.service.RedisRefreshTokenService;
import az.schedule.backendservice.utils.JwtService;
import az.schedule.backendservice.utils.MailService;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.security.SecureRandom;
import java.text.ParseException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {
    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;
    private final MailService mailService;
    private final ModelMapper modelMapper;
    private final RedisRefreshTokenService redisRefreshTokenService;
    private final AccountConverter accountConverter;
    private final ThreadPoolTaskScheduler taskScheduler;
    private final PasswordEncoder passwordEncoder;
    private final OutboundGoogleClient outboundGoogleClient;
    private final GoogleUserInfoClient googleUserInfoClient;

    @Value("${google.client-id}")
    private String googleClientId;

    @Value("${google.client-secret}")
    private String googleClientSecret;

    @Value("${google.redirect-uri}")
    private String googleRedirectUri;

    @Override
    public AuthenticationResponse authenticate(AuthenticationRequest authenticationRequest, HttpServletResponse response) {
        Account account = accountRepository
                .findByUsername(authenticationRequest.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        AuthenticationResponse authenticationResponse = new AuthenticationResponse();
        if (account == null
                || !passwordEncoder.matches(authenticationRequest.getPassword(), account.getPassword())
                || Boolean.TRUE.equals(!account.getIsActive())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        } else {
            String token = jwtService.generateToken(account, TokenType.ACCESS_TOKEN);
            String refreshToken = jwtService.generateToken(account, TokenType.REFRESH_TOKEN);
            redisRefreshTokenService.setToken(account.getId().toString(), refreshToken, 7L, TimeUnit.DAYS);

            accountRepository.save(account);

            Cookie cookie = new Cookie("refreshToken", refreshToken);
            cookie.setHttpOnly(true);
            cookie.setSecure(false);
            cookie.setDomain("localhost");
            cookie.setPath("/");
            cookie.setMaxAge(7 * 24 * 60 * 60);

            response.addCookie(cookie);

            authenticationResponse.setToken(token);
            authenticationResponse.setSuccess(true);
        }
        return authenticationResponse;
    }

    @Override
    public AccountCreationResponse createAccount(AccountCreationRequest request) {
        Account acc = accountConverter.toAccountEntity(request);

        if (accountRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USERNAME_EXISTED);
        }
        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }
        if (accountRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new AppException(ErrorCode.PHONE_NUMBER_EXISTED);
        }

        Account a = accountRepository.save(acc);
        return modelMapper.map(a, AccountCreationResponse.class);
    }

    @Override
    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        try {
            jwtService.verifyToken(request.getToken(), TokenType.ACCESS_TOKEN);
        } catch (AppException e) {
            return IntrospectResponse.builder().valid(false).build();
        }
        return IntrospectResponse.builder().valid(true).build();
    }

    @Override
    public boolean checkUsername(String username) {
        return accountRepository.existsByUsername(username);
    }

    @Override
    public UniqueInformationCheckResponse checkUniqueInformation(UniqueInformCheckRequest request) {
        boolean isEmailValid = !accountRepository.existsByEmail(request.getEmail());
        boolean isPhoneValid = !accountRepository.existsByPhoneNumber(request.getPhone());
        return UniqueInformationCheckResponse.builder()
                .isEmailValid(isEmailValid)
                .isPhoneValid(isPhoneValid)
                .build();
    }

    @Override
    public SendOTPResponse sendOTP(String key) {
        boolean checkEmail = accountRepository.existsByEmail(key);
        boolean checkUsername = accountRepository.existsByUsername(key);
        if (checkEmail || checkUsername) {
            String token = generate6DigitCode();
            Account acc = null;
            if (checkEmail) {
                acc = accountRepository
                        .findByEmail(key)
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
                mailService.sendEmail(acc.getEmail(), token, token);
            } else {
                acc = accountRepository
                        .findByUsername(key)
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
                mailService.sendEmail(acc.getEmail(), token, token);
            }
            acc.setOtp(token);
            accountRepository.save(acc);

            scheduleTokenDeletion(acc.getId());

            return SendOTPResponse.builder()
                    .email(acc.getEmail())
                    .username(acc.getUsername())
                    .isValid(true)
                    .build();
        } else {
            return SendOTPResponse.builder().isValid(false).build();
        }
    }

    @Override
    public boolean checkOTP(OTPCheckRequest request) {
        Account account = accountRepository
                .findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return account.getOtp().equals(request.getOtp());
    }

    @Override
    public void changePassword(ChangePasswordRequest request) {
        Account account = accountRepository
                .findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (account.getOtp().equals(request.getOTP())) {
            account.setPassword(request.getNewPassword());
        } else {
            throw new AppException(ErrorCode.OTP_INVALID);
        }
        account.setOtp(null);
        accountRepository.save(account);
    }

    @Override
    public AuthenticationResponse refreshToken(HttpServletRequest request) {
        String refreshToken = null;

        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                if ("refreshToken".equals(c.getName())) {
                    refreshToken = c.getValue();
                    break;
                }
            }
        }

        try {
            if (!StringUtils.hasLength(refreshToken))
                throw new AppException(ErrorCode.UNAUTHORIZED);

            SignedJWT signedJWT = jwtService.verifyToken(refreshToken, TokenType.REFRESH_TOKEN);

            String username = signedJWT.getJWTClaimsSet().getSubject();

            Account account = accountRepository
                    .findByUsername(username)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

            String storedToken = redisRefreshTokenService.getToken(account.getId().toString());

            if (storedToken == null || !storedToken.equals(refreshToken)) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }

            String accessToken = jwtService.generateToken(account, TokenType.ACCESS_TOKEN);

            return AuthenticationResponse.builder()
                    .token(accessToken)
                    .success(true)
                    .build();
        } catch (ParseException | JOSEException e) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    @Override
    public AuthenticationResponse outboundAuthenticate(String code) {
        try {
            // Build form parameters for Google OAuth2 token exchange
            Map<String, String> formParams = new java.util.HashMap<>();
            formParams.put("code", code);
            formParams.put("client_id", googleClientId);
            formParams.put("client_secret", googleClientSecret);
            formParams.put("redirect_uri", googleRedirectUri);
            formParams.put("grant_type", "authorization_code");
            
            OutboundAuthenticationResponse tokenResponse = outboundGoogleClient.exchangeToken(formParams);

            UserInfoResponse userInfo = googleUserInfoClient.getUserInfo("json", tokenResponse.getAccessToken());
            
            log.info("Google OAuth2 login attempt for email: {}", userInfo.getEmail());

            Account account = accountRepository.findByEmail(userInfo.getEmail())
                    .orElseGet(() -> {
                        log.info("Creating new account for Google user: {}", userInfo.getEmail());
                        
                        Account newAccount = new Account();
                        newAccount.setEmail(userInfo.getEmail());
                        newAccount.setFullName(userInfo.getName());
                        newAccount.setUsername(generateUsernameFromEmail(userInfo.getEmail()));
                        newAccount.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString())); // Random password
                        newAccount.setIsActive(true);
                        newAccount.setAvatarUrl(userInfo.getPicture());
                        
                        Role userRole = roleRepository.findByCode("USER")
                                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
                        newAccount.setRole(userRole);
                        
                        return accountRepository.save(newAccount);
                    });

            if (Boolean.FALSE.equals(account.getIsActive())) {
                throw new AppException(ErrorCode.ACCOUNT_DISABLED);
            }

            // Generate JWT token
            String token = jwtService.generateToken(account, TokenType.ACCESS_TOKEN);
            
            return AuthenticationResponse.builder()
                    .token(token)
                    .success(true)
                    .build();
                    
        } catch (Exception e) {
            log.error("OAuth2 authentication failed", e);
            throw new AppException(ErrorCode.OAUTH2_AUTHENTICATION_FAILED);
        }
    }

    private String generateUsernameFromEmail(String email) {
        String baseUsername = email.split("@")[0].toLowerCase();
        String username = baseUsername;
        int counter = 1;
        
        // Ensure username is unique
        while (accountRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }
        
        return username;
    }

    private String generate6DigitCode() {
        SecureRandom random = new SecureRandom();
        return String.format("%06d", random.nextInt(1000000));
    }

    private void scheduleTokenDeletion(Long accountID) {
        taskScheduler.schedule(
                () -> accountRepository.clearOTP(accountID), Instant.now().plusSeconds(300));
    }
}
