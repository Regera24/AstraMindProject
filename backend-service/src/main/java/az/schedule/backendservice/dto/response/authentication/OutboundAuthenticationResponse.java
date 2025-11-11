package az.schedule.backendservice.dto.response.authentication;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class OutboundAuthenticationResponse {
    String accessToken;
    String idToken;
    Long expiresIn;
    String tokenType;
    String scope;
    String refreshToken;
}
