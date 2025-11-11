package az.schedule.backendservice.dto.request.authentication;

import az.schedule.backendservice.utils.custom_constraint.PhoneConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AccountCreationRequest {
    @NotNull
    String username;

    @NotNull
    String fullName;

    @NotNull
    String password;

    @Email
    String email;

    @NotNull
    @PhoneConstraint
    String phoneNumber;

    @NotNull
    String role;

    String avatar;

    LocalDate birthDate;

    Boolean gender;
}
