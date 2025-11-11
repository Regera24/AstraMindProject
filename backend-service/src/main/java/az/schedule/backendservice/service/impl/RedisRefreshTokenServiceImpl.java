package az.schedule.backendservice.service.impl;

import az.schedule.backendservice.service.RedisRefreshTokenService;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class RedisRefreshTokenServiceImpl extends BaseRedisServiceImpl implements RedisRefreshTokenService {
    public RedisRefreshTokenServiceImpl(RedisTemplate<String, Object> redisTemplate) {
        super(redisTemplate);
    }

    @Override
    public boolean existsByTokenId(String key) {
        return this.exists(key);
    }

    @Override
    public void setToken(String key, String value, Long expire, TimeUnit timeUnit) {
        this.set(key, value, expire, timeUnit);
    }

    @Override
    public void deleteToken(String key) {
        this.delete(key);
    }

    @Override
    public String getToken(String key) {
        Object token = this.get(key);
        return token != null ? token.toString() : null;
    }
}
