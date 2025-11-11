package az.schedule.backendservice.config;

import java.util.List;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI openAPI(
            @Value("${open.api.title}") String title,
            @Value("${open.api.version}") String version,
            @Value("${open.api.description}") String description,
            @Value("${open.api.serverName}") String serverName,
            @Value("${open.api.serverUrl}") String serverUrl) {

        return new OpenAPI()
                .info(new Info()
                        .title(title)
                        .version(version)
                        .description(description)
                        .license(new License().name("API license").url("http://domain.com")))
                .servers(List.of(new Server().url(serverUrl).description(serverName)));
    }

    @Bean
    public GroupedOpenApi accountApiGroup() {
        return GroupedOpenApi.builder()
                .group("account-service-api")
                .pathsToMatch("/api/v1/accounts/**")
                .build();
    }

    @Bean
    public GroupedOpenApi taskApiGroup() {
        return GroupedOpenApi.builder()
                .group("task-service-api")
                .pathsToMatch("/api/v1/tasks/**")
                .build();
    }

    @Bean
    public GroupedOpenApi notificationApiGroup() {
        return GroupedOpenApi.builder()
                .group("notification-service-api")
                .pathsToMatch("/api/v1/notifications/**")
                .build();
    }

    @Bean
    public GroupedOpenApi authenticationApiGroup() {
        return GroupedOpenApi.builder()
                .group("authentication-service-api")
                .pathsToMatch("/api/v1/auth/**")
                .build();
    }

    @Bean
    public GroupedOpenApi categoryApiGroup() {
        return GroupedOpenApi.builder()
                .group("category-service-api")
                .pathsToMatch("/api/v1/categories/**")
                .build();
    }
}
