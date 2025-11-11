package az.schedule.backendservice.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
public interface BaseRedisService {
    void set(String key, String value);

    void set(String key, String value, Long expire, TimeUnit timeUnit);

    void setTimeToLive(String key, Long timoutInDays);

    void hashSet(String key, String field, String value);

    boolean hashExists(String key, String field);

    boolean exists(String key);

    Object get(String key);

    Map<String, Object> getField(String key);

    Object hashGet(String key, String field);

    List<Object> hashGetByFieldPrefix(String key, String prefix);

    Set<String> getFieldPrefixes(String key);

    void delete(String key);

    void delete(String key, String field);

    void delete(String key, List<String> fields);
}
