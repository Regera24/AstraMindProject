package az.schedule.backendservice.service;

import az.schedule.backendservice.dto.TaskDTO;
import az.schedule.backendservice.dto.request.task.NaturalLanguageTaskRequest;
import az.schedule.backendservice.dto.response.ImageTaskParseResponse;
import az.schedule.backendservice.dto.response.ParsedTaskResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AITaskService {
    /**
     * Parse natural language prompt into structured task data
     * @param request Natural language prompt from user
     * @param language User's preferred language (e.g., "en", "vi")
     * @return Parsed task information
     */
    ParsedTaskResponse parseTaskFromNaturalLanguage(NaturalLanguageTaskRequest request, String language);
    
    /**
     * Parse natural language and directly create task
     * @param request Natural language prompt from user
     * @param accountId User account ID
     * @param language User's preferred language (e.g., "en", "vi")
     * @return Created task
     */
    TaskDTO createTaskFromNaturalLanguage(NaturalLanguageTaskRequest request, Long accountId, String language);
    
    /**
     * Parse image to extract task information
     * @param image Image file (calendar, schedule, email, etc.)
     * @param additionalContext Optional context from user
     * @param language User's preferred language (e.g., "en", "vi")
     * @return Parsed tasks from image
     */
    ImageTaskParseResponse parseTasksFromImage(MultipartFile image, String additionalContext, String language);
    
    /**
     * Parse image and directly create tasks
     * @param image Image file
     * @param additionalContext Optional context
     * @param accountId User account ID
     * @param language User's preferred language (e.g., "en", "vi")
     * @return List of created tasks
     */
    List<TaskDTO> createTasksFromImage(MultipartFile image, String additionalContext, Long accountId, String language);
}
