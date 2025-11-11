package az.schedule.backendservice.dto.response.authentication;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UniqueInformationCheckResponse {
    boolean isEmailValid;
    boolean isPhoneValid;
}
