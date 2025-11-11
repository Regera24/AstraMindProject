package az.schedule.backendservice.dto.request.authentication;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class OTPCheckRequest {
    @NotNull
    private String otp;

    @NotNull
    private String username;
}
