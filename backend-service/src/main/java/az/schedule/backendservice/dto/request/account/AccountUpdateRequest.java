package az.schedule.backendservice.dto.request.account;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AccountUpdateRequest {
    @Size(min = 2, max = 100, message = "{validation.fullname.size}")
    String fullName;
    
    @Email(message = "{validation.email.invalid}")
    String email;
    
    Boolean gender;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    LocalDate birthDate;
    
    @Pattern(regexp = "^[0-9]{10,15}$", message = "{validation.phone.pattern}")
    String phoneNumber;
    
    String avatarUrl;
    
    Long roleId;
    
    Long subscriptionId;
}
