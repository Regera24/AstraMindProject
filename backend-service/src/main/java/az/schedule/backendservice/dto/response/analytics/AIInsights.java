package az.schedule.backendservice.dto.response.analytics;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AIInsights {
    String summary; // Overall productivity summary
    List<String> strengths; // What user is doing well
    List<String> weaknesses; // Areas for improvement
    List<String> suggestions; // Actionable recommendations
    String productivityScore; // "Excellent", "Good", "Average", "Needs Improvement"
    double scorePercentage; // 0-100
}
