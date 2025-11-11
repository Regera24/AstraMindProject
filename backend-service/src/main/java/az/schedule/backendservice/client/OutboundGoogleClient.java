package az.schedule.backendservice.client;

import az.schedule.backendservice.config.FeignFormConfig;
import az.schedule.backendservice.dto.response.authentication.OutboundAuthenticationResponse;
import feign.Headers;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "outbound-google", url = "https://oauth2.googleapis.com", configuration = FeignFormConfig.class)
public interface OutboundGoogleClient {
    @PostMapping(value = "/token")
    @Headers("Content-Type: application/x-www-form-urlencoded")
    OutboundAuthenticationResponse exchangeToken(@RequestBody Map<String, ?> formParams);
}
