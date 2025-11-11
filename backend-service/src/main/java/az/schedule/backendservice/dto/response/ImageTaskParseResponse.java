package az.schedule.backendservice.dto.response;

import az.schedule.backendservice.dto.TaskDTO;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ImageTaskParseResponse {
    boolean isScheduleRelated;
    String message;
    List<ParsedTaskResponse> tasks;
    int taskCount;
}
