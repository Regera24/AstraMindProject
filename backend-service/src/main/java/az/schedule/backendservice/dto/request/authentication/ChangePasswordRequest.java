package az.schedule.backendservice.dto.request.authentication;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ChangePasswordRequest {
    @NotNull
    private String username;

    @NotNull
    private String OTP;

    @NotNull
    private String newPassword;
}
