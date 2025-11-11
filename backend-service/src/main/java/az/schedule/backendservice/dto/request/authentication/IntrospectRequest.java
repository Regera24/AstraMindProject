package az.schedule.backendservice.dto.request.authentication;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class IntrospectRequest {
    @NotNull
    private String token;
}
