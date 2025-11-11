package az.schedule.backendservice.service.impl;

import az.schedule.backendservice.dto.TaskDTO;
import az.schedule.backendservice.dto.request.task.NaturalLanguageTaskRequest;
import az.schedule.backendservice.dto.request.task.TaskRequest;
import az.schedule.backendservice.dto.response.ImageTaskParseResponse;
import az.schedule.backendservice.dto.response.ParsedTaskResponse;
import az.schedule.backendservice.enums.Priority;
import az.schedule.backendservice.enums.TaskStatus;
import az.schedule.backendservice.exception.AppException;
import az.schedule.backendservice.exception.ErrorCode;
import az.schedule.backendservice.service.AITaskService;
import az.schedule.backendservice.service.TaskService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@Service
@RequiredArgsConstructor
@Slf4j
public class AITaskServiceImpl implements AITaskService {
    
    private final ChatModel chatModel;
    private final TaskService taskService;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();
    
    @Value("${spring.ai.openai.api-key}")
    private String geminiApiKey;
    
    private static final String SYSTEM_PROMPT = """
            You are an intelligent task parser for a scheduling application.
            Your job is to extract task information from natural language input.
            
            Extract the following information:
            1. title: A clear, concise task title (REQUIRED)
            2. description: Detailed description if provided
            3. startTime: Start date and time in ISO format (yyyy-MM-dd'T'HH:mm:ss)
            4. endTime: End date and time in ISO format (yyyy-MM-dd'T'HH:mm:ss)
            5. priority: LOW, MEDIUM, or HIGH
            6. status: TODO, IN_PROGRESS, DONE, or PAUSED
            7. suggestedCategory: A suggested category name based on the task content
            
            Rules:
            - If dates are relative (e.g., "tomorrow", "next week"), calculate the actual date from current time
            - Current date and time: %s
            - If no time is specified, use 09:00:00 for start time and 17:00:00 for end time
            - Default priority is MEDIUM if not specified
            - Default status is TODO if not specified
            - Suggest a meaningful category based on task content
            - If the input is unclear, extract as much as possible but title is mandatory
            
            Return ONLY a valid JSON object with this exact structure:
            {
              "title": "string",
              "description": "string or null",
              "startTime": "yyyy-MM-dd'T'HH:mm:ss or null",
              "endTime": "yyyy-MM-dd'T'HH:mm:ss or null",
              "priority": "LOW/MEDIUM/HIGH or null",
              "status": "TODO/IN_PROGRESS/DONE/PAUSED or null",
              "suggestedCategory": "string or null"
            }
            """;

    @Override
    public ParsedTaskResponse parseTaskFromNaturalLanguage(NaturalLanguageTaskRequest request) {
        try {
            String currentDateTime = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            String systemPrompt = String.format(SYSTEM_PROMPT, currentDateTime);
            
            ChatClient chatClient = ChatClient.create(chatModel);
            
            String aiResponse = chatClient.prompt()
                    .system(systemPrompt)
                    .user(request.getPrompt())
                    .call()
                    .content();
            
            log.info("AI Response: {}", aiResponse);
            
            return parseAIResponse(aiResponse);
            
        } catch (Exception e) {
            log.error("Error parsing task from natural language: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.AI_PARSING_ERROR);
        }
    }

    @Override
    public TaskDTO createTaskFromNaturalLanguage(NaturalLanguageTaskRequest request, Long accountId) {
        ParsedTaskResponse parsedTask = parseTaskFromNaturalLanguage(request);
        
        TaskRequest taskRequest = TaskRequest.builder()
                .title(parsedTask.getTitle())
                .description(parsedTask.getDescription())
                .startTime(parsedTask.getStartTime())
                .endTime(parsedTask.getEndTime())
                .priority(parsedTask.getPriority() != null ? parsedTask.getPriority() : Priority.MEDIUM)
                .status(parsedTask.getStatus() != null ? parsedTask.getStatus() : TaskStatus.TODO)
                .categoryId(null)
                .build();
        
        return taskService.createTask(taskRequest, accountId);
    }
    
    private ParsedTaskResponse parseAIResponse(String aiResponse) {
        try {
            String cleanedResponse = aiResponse.trim();
            if (cleanedResponse.startsWith("```json")) {
                cleanedResponse = cleanedResponse.substring(7);
            } else if (cleanedResponse.startsWith("```")) {
                cleanedResponse = cleanedResponse.substring(3);
            }
            if (cleanedResponse.endsWith("```")) {
                cleanedResponse = cleanedResponse.substring(0, cleanedResponse.length() - 3);
            }
            cleanedResponse = cleanedResponse.trim();
            
            JsonNode jsonNode = objectMapper.readTree(cleanedResponse);
            
            ParsedTaskResponse response = ParsedTaskResponse.builder()
                    .title(getStringValue(jsonNode, "title"))
                    .description(getStringValue(jsonNode, "description"))
                    .startTime(parseDateTime(getStringValue(jsonNode, "startTime")))
                    .endTime(parseDateTime(getStringValue(jsonNode, "endTime")))
                    .priority(parsePriority(getStringValue(jsonNode, "priority")))
                    .status(parseStatus(getStringValue(jsonNode, "status")))
                    .suggestedCategory(getStringValue(jsonNode, "suggestedCategory"))
                    .build();
            
            // Validate that at least title is present
            if (response.getTitle() == null || response.getTitle().trim().isEmpty()) {
                throw new AppException(ErrorCode.INVALID_TASK_DATA);
            }
            
            return response;
            
        } catch (JsonProcessingException e) {
            log.error("Failed to parse AI response as JSON: {}", aiResponse, e);
            throw new AppException(ErrorCode.AI_PARSING_ERROR);
        }
    }
    
    private String getStringValue(JsonNode node, String fieldName) {
        JsonNode field = node.get(fieldName);
        if (field == null || field.isNull()) {
            return null;
        }
        return field.asText();
    }
    
    private LocalDateTime parseDateTime(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.trim().isEmpty() || dateTimeStr.equalsIgnoreCase("null")) {
            return null;
        }
        try {
            return LocalDateTime.parse(dateTimeStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (DateTimeParseException e) {
            log.warn("Failed to parse datetime: {}", dateTimeStr);
            return null;
        }
    }
    
    private Priority parsePriority(String priorityStr) {
        if (priorityStr == null || priorityStr.trim().isEmpty() || priorityStr.equalsIgnoreCase("null")) {
            return Priority.MEDIUM;
        }
        try {
            return Priority.valueOf(priorityStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid priority value: {}, using MEDIUM", priorityStr);
            return Priority.MEDIUM;
        }
    }
    
    private TaskStatus parseStatus(String statusStr) {
        if (statusStr == null || statusStr.trim().isEmpty() || statusStr.equalsIgnoreCase("null")) {
            return TaskStatus.TODO;
        }
        try {
            return TaskStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid status value: {}, using TODO", statusStr);
            return TaskStatus.TODO;
        }
    }
    
    // ==================== IMAGE-BASED TASK CREATION ====================
    
    private static final String IMAGE_VISION_PROMPT = """
            You are an intelligent task extraction system that analyzes images.
            
            IMPORTANT: First, determine if this image is related to scheduling, tasks, calendars, or work.
            
            If the image is NOT related to scheduling/tasks (e.g., random photos, landscapes, food, etc.),
            respond with ONLY this JSON:
            {
              "isScheduleRelated": false,
              "message": "This image does not contain schedule or task information.",
              "tasks": []
            }
            
            If the image IS schedule-related (calendar, todo list, email about meetings, schedule screenshots, etc.),
            extract ALL tasks/events from the image and respond with:
            {
              "isScheduleRelated": true,
              "message": "Successfully extracted tasks from image",
              "tasks": [
                {
                  "title": "task title",
                  "description": "task description",
                  "startTime": "yyyy-MM-dd'T'HH:mm:ss or null",
                  "endTime": "yyyy-MM-dd'T'HH:mm:ss or null",
                  "priority": "LOW/MEDIUM/HIGH or null",
                  "status": "TODO/IN_PROGRESS/DONE/PAUSED or null",
                  "suggestedCategory": "category name or null"
                }
              ]
            }
            
            Rules:
            - Extract ALL visible tasks/events from the image
            - Current date and time: %s
            - If dates are relative, calculate actual dates
            - If no time specified, use 09:00:00 for start, 17:00:00 for end
            - Default priority is MEDIUM, default status is TODO
            - Be strict: only mark isScheduleRelated=true for actual schedule content
            
            Return ONLY valid JSON, no markdown formatting.
            """;
    
    private static final long MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final String[] ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png"};
    
    @Override
    public ImageTaskParseResponse parseTasksFromImage(MultipartFile image, String additionalContext) {
        try {
            validateImage(image);
            
            String currentDateTime = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            String promptText = String.format(IMAGE_VISION_PROMPT, currentDateTime);
            
            if (additionalContext != null && !additionalContext.trim().isEmpty()) {
                promptText += "\n\nAdditional context from user: " + additionalContext;
            }
            
            byte[] imageBytes = image.getBytes();
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            
            String mimeType = image.getContentType();
            if (mimeType == null) {
                mimeType = "image/jpeg";
            }
            
            // Call Gemini Vision API directly
            String aiResponse = callGeminiVisionAPI(promptText, base64Image, mimeType);
            
            log.info("AI Vision Response: {}", aiResponse);
            
            return parseImageAIResponse(aiResponse);
            
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error processing image: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.IMAGE_PROCESSING_ERROR);
        }
    }
    
    @Override
    public List<TaskDTO> createTasksFromImage(MultipartFile image, String additionalContext, Long accountId) {
        ImageTaskParseResponse parseResponse = parseTasksFromImage(image, additionalContext);
        
        if (!parseResponse.isScheduleRelated()) {
            throw new AppException(ErrorCode.IMAGE_NOT_SCHEDULE_RELATED);
        }
        
        List<TaskDTO> createdTasks = new java.util.ArrayList<>();
        
        for (ParsedTaskResponse parsedTask : parseResponse.getTasks()) {
            try {
                TaskRequest taskRequest = TaskRequest.builder()
                        .title(parsedTask.getTitle())
                        .description(parsedTask.getDescription())
                        .startTime(parsedTask.getStartTime())
                        .endTime(parsedTask.getEndTime())
                        .priority(parsedTask.getPriority() != null ? parsedTask.getPriority() : Priority.MEDIUM)
                        .status(parsedTask.getStatus() != null ? parsedTask.getStatus() : TaskStatus.TODO)
                        .categoryId(null)
                        .build();
                
                TaskDTO createdTask = taskService.createTask(taskRequest, accountId);
                createdTasks.add(createdTask);
            } catch (Exception e) {
                log.warn("Failed to create task: {}", parsedTask.getTitle(), e);
            }
        }
        
        return createdTasks;
    }
    
    private void validateImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_IMAGE_FORMAT);
        }
        
        if (image.getSize() > MAX_IMAGE_SIZE) {
            throw new AppException(ErrorCode.IMAGE_TOO_LARGE);
        }
        
        String contentType = image.getContentType();
        if (contentType == null || !isAllowedImageType(contentType)) {
            throw new AppException(ErrorCode.INVALID_IMAGE_FORMAT);
        }
    }
    
    private boolean isAllowedImageType(String contentType) {
        for (String allowedType : ALLOWED_IMAGE_TYPES) {
            if (allowedType.equalsIgnoreCase(contentType)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Call Gemini Vision API directly via HTTP
     */
    private String callGeminiVisionAPI(String prompt, String base64Image, String mimeType) {
        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=" + geminiApiKey;
            
            // Build request body for Gemini API
            Map<String, Object> requestBody = new HashMap<>();
            
            // Create content with role
            Map<String, Object> content = new HashMap<>();
            content.put("role", "user");
            
            // Create parts array (text + image)
            List<Map<String, Object>> parts = new java.util.ArrayList<>();
            
            // Add text part
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);
            parts.add(textPart);
            
            // Add image part with inline_data
            Map<String, Object> imagePart = new HashMap<>();
            Map<String, String> inlineData = new HashMap<>();
            inlineData.put("mime_type", mimeType);
            inlineData.put("data", base64Image);
            imagePart.put("inline_data", inlineData);
            parts.add(imagePart);
            
            content.put("parts", parts);
            requestBody.put("contents", List.of(content));
            
            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // Make API call
            log.debug("Calling Gemini Vision API...");
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                String.class
            );
            
            // Parse response to extract text
            JsonNode responseJson = objectMapper.readTree(response.getBody());
            String aiResponse = responseJson
                .path("candidates")
                .get(0)
                .path("content")
                .path("parts")
                .get(0)
                .path("text")
                .asText();
            
            return aiResponse;
            
        } catch (Exception e) {
            log.error("Error calling Gemini Vision API: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.IMAGE_PROCESSING_ERROR);
        }
    }
    
    private ImageTaskParseResponse parseImageAIResponse(String aiResponse) {
        try {
            String cleanedResponse = aiResponse.trim();
            if (cleanedResponse.startsWith("```json")) {
                cleanedResponse = cleanedResponse.substring(7);
            } else if (cleanedResponse.startsWith("```")) {
                cleanedResponse = cleanedResponse.substring(3);
            }
            if (cleanedResponse.endsWith("```")) {
                cleanedResponse = cleanedResponse.substring(0, cleanedResponse.length() - 3);
            }
            cleanedResponse = cleanedResponse.trim();
            
            JsonNode rootNode = objectMapper.readTree(cleanedResponse);
            
            boolean isScheduleRelated = rootNode.has("isScheduleRelated") 
                    && rootNode.get("isScheduleRelated").asBoolean();
            
            String message = getStringValue(rootNode, "message");
            
            List<ParsedTaskResponse> tasks = new java.util.ArrayList<>();
            
            if (isScheduleRelated && rootNode.has("tasks") && rootNode.get("tasks").isArray()) {
                JsonNode tasksArray = rootNode.get("tasks");
                for (JsonNode taskNode : tasksArray) {
                    try {
                        ParsedTaskResponse task = ParsedTaskResponse.builder()
                                .title(getStringValue(taskNode, "title"))
                                .description(getStringValue(taskNode, "description"))
                                .startTime(parseDateTime(getStringValue(taskNode, "startTime")))
                                .endTime(parseDateTime(getStringValue(taskNode, "endTime")))
                                .priority(parsePriority(getStringValue(taskNode, "priority")))
                                .status(parseStatus(getStringValue(taskNode, "status")))
                                .suggestedCategory(getStringValue(taskNode, "suggestedCategory"))
                                .build();
                        
                        if (task.getTitle() != null && !task.getTitle().trim().isEmpty()) {
                            tasks.add(task);
                        }
                    } catch (Exception e) {
                        log.warn("Failed to parse task from image response: {}", e.getMessage());
                    }
                }
            }
            
            return ImageTaskParseResponse.builder()
                    .isScheduleRelated(isScheduleRelated)
                    .message(message != null ? message : (isScheduleRelated ? "Tasks extracted" : "Not schedule related"))
                    .tasks(tasks)
                    .taskCount(tasks.size())
                    .build();
            
        } catch (JsonProcessingException e) {
            log.error("Failed to parse image AI response as JSON: {}", aiResponse, e);
            throw new AppException(ErrorCode.AI_PARSING_ERROR);
        }
    }
}
