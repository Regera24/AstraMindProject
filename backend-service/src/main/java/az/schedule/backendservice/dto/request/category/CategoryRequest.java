package az.schedule.backendservice.dto.request.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryRequest {
    @NotBlank(message = "{validation.name.required}")
    @Size(min = 2, max = 50, message = "{validation.name.size}")
    String name;
    
    @Size(max = 500, message = "{validation.description.size}")
    String description;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "{validation.color.pattern}")
    String color;
}
