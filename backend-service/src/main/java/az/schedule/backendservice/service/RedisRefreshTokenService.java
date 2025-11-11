package az.schedule.backendservice.service;

import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public interface RedisRefreshTokenService {
    public boolean existsByTokenId(String key);

    public void setToken(String key, String value, Long expire, TimeUnit timeUnit);

    public void deleteToken(String key);

    public String getToken(String key);
}
