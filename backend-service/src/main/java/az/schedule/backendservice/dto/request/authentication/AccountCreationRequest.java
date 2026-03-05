package az.schedule.backendservice.dto.request.authentication;

import az.schedule.backendservice.utils.custom_constraint.PhoneConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AccountCreationRequest {
    @NotBlank(message = "{validation.username.required}")
    @Size(min = 3, max = 50, message = "{validation.username.size}")
    @Pattern(regexp = "^[a-zA-Z0-9_-]+$", message = "{validation.username.pattern}")
    String username;

    @NotBlank(message = "{validation.fullname.required}")
    @Size(min = 2, max = 100, message = "{validation.fullname.size}")
    String fullName;

    @NotBlank(message = "{validation.password.required}")
    @Size(min = 6, max = 100, message = "{validation.password.size}")
    String password;

    @NotBlank(message = "{validation.email.required}")
    @Email(message = "{validation.email.invalid}")
    String email;

    @PhoneConstraint
    String phoneNumber;

    @NotBlank(message = "{validation.role.required}")
    String role;

    String avatar;

    LocalDate birthDate;

    Boolean gender;
}
