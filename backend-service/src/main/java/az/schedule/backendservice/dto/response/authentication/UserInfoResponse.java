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
public class UserInfoResponse {
    String id;
    String email;
    String name;
    String givenName;
    String familyName;
    boolean verifiedEmail;
    String picture;
}
