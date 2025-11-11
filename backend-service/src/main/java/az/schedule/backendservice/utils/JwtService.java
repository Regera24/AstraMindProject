package az.schedule.backendservice.utils;

import az.schedule.backendservice.entity.Account;
import az.schedule.backendservice.enums.TokenType;
import az.schedule.backendservice.exception.AppException;
import az.schedule.backendservice.exception.ErrorCode;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtService {
    @Value("${app.jwtSecret}")
    private String jwtSecret;

    @Value("${app.jwtRefresh}")
    private String jwtRefresh;

    @Value("${app.jwtExpirationMs}")
    private long jwtExpirations;

    @Value("${app.jwtRefreshExpirationMs}")
    private long jwtRefreshExpirationMs;

    public String generateToken(Account account, TokenType tokenType) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        String secret = tokenType.equals(TokenType.ACCESS_TOKEN) ? jwtSecret : jwtRefresh;
        long expiredTime = tokenType.equals(TokenType.ACCESS_TOKEN) ? jwtExpirations : jwtRefreshExpirationMs;

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(account.getUsername())
                .issuer("az.schedule.com")
                .issueTime(new Date())
                .claim("scope", account.getRole() != null && account.getRole().getCode() != null 
                        ? account.getRole().getCode() : "NEW_USER")
                .claim("accountId", account.getId())
                .expirationTime(new Date(
                        Instant.now().plus(expiredTime, ChronoUnit.SECONDS).toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(secret.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            throw new AppException(ErrorCode.UNCATEGORIZED);
        }
    }

    public SignedJWT verifyToken(String token, TokenType tokenType) throws JOSEException, ParseException {
        String secret = tokenType.equals(TokenType.ACCESS_TOKEN) ? jwtSecret : jwtRefresh;
        JWSVerifier verifier = new MACVerifier(secret.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiryDate = signedJWT.getJWTClaimsSet().getExpirationTime();

        if (!(signedJWT.verify(verifier)) && expiryDate.after(new Date()))
            throw new AppException(ErrorCode.UNAUTHORIZED);

        return signedJWT;
    }

    public long extractTokenExpired(String token) {
        try {
            long expirationTime =
                    SignedJWT.parse(token).getJWTClaimsSet().getExpirationTime().getTime();
            long currentTime = System.currentTimeMillis();
            return Math.max(expirationTime - currentTime, 0);
        } catch (ParseException e) {
            throw new AppException(ErrorCode.UNCATEGORIZED);
        }
    }

    public String extractUsername(String token) {
        try {
            return SignedJWT.parse(token).getJWTClaimsSet().getSubject();
        } catch (ParseException e) {
            throw new AppException(ErrorCode.UNCATEGORIZED);
        }
    }
}