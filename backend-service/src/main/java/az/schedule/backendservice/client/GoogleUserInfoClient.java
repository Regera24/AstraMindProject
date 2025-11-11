package az.schedule.backendservice.client;

import az.schedule.backendservice.dto.response.authentication.UserInfoResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "google-user-info", url = "https://www.googleapis.com")
public interface GoogleUserInfoClient {
    @GetMapping(value = "/oauth2/v1/userinfo")
    UserInfoResponse getUserInfo(@RequestParam("alt") String alt, @RequestParam("access_token") String token);
}
