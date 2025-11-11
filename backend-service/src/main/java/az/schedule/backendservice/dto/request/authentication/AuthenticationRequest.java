package az.schedule.backendservice.dto.request.authentication;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AuthenticationRequest {
    @NotNull
    private String username;

    @NotNull
    private String password;
}
