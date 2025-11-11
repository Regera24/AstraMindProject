package az.schedule.backendservice.dto.request.account;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
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
    String fullName;
    
    @Email(message = "Email should be valid")
    String email;
    
    Boolean gender;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    LocalDate birthDate;
    
    String phoneNumber;
    
    String avatarUrl;
    
    Long roleId;
    
    Long subscriptionId;
}
