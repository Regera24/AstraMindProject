package az.schedule.backendservice.dto.response.authentication;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AccountCreationResponse {
    Long accountID;

    String username;

    String email;

    String phoneNumber;
}
