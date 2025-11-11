package az.schedule.backendservice.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public enum TaskStatus {
    TODO("Not do yet"), IN_PROGRESS("In progress"), DONE("Done"), PAUSED("Cancelled");
    private String description;
}
