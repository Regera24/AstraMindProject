package az.schedule.backendservice.dto.request.authentication;

import az.schedule.backendservice.utils.custom_constraint.PhoneConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UniqueInformCheckRequest {
    @NotNull
    @Email
    String email;

    @NotNull
    @PhoneConstraint
    String phone;
}
