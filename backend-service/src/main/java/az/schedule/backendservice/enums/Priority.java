package az.schedule.backendservice.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public enum Priority {
    LOW("Not need to do early"), MEDIUM("Need to do in time"), HIGH("Need to alertly do");
    private String description;
}
