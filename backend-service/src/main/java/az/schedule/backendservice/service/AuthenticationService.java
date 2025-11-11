package az.schedule.backendservice.service;

import az.schedule.backendservice.dto.request.authentication.*;
import az.schedule.backendservice.dto.response.authentication.*;
import com.nimbusds.jose.JOSEException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;

import java.text.ParseException;

@Service
public interface AuthenticationService {
    public AuthenticationResponse authenticate(
            AuthenticationRequest authenticationRequest, HttpServletResponse response);

    public AccountCreationResponse createAccount(AccountCreationRequest request);

    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException;

    public boolean checkUsername(String username);

    public UniqueInformationCheckResponse checkUniqueInformation(UniqueInformCheckRequest request);

    public SendOTPResponse sendOTP(String key);

    public boolean checkOTP(OTPCheckRequest request);

    public void changePassword(ChangePasswordRequest request);

    public AuthenticationResponse refreshToken(HttpServletRequest request);

    public AuthenticationResponse outboundAuthenticate(String code);
}
