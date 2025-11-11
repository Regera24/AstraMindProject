package az.schedule.backendservice.dto.response.analytics;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HeatmapData {
    int dayOfWeek; // 1=Monday, 7=Sunday
    int hour; // 0-23
    long taskCount;
    double intensity; // 0.0 to 1.0 for color intensity
}
