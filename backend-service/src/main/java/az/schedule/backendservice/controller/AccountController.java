package az.schedule.backendservice.controller;

import az.schedule.backendservice.dto.AccountDTO;
import az.schedule.backendservice.dto.request.account.AccountUpdateRequest;
import az.schedule.backendservice.dto.response.ApiResponse;
import az.schedule.backendservice.service.AccountService;
import az.schedule.backendservice.utils.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Account API", description = "Endpoints for managing user accounts")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/accounts")
public class AccountController {
    private final AccountService accountService;

    @Operation(summary = "Get current account", description = "Get the currently authenticated user's account information")
    @GetMapping("/me")
    public ApiResponse<AccountDTO> getCurrentAccount() {
        AccountDTO account = accountService.getCurrentAccount();
        return ApiResponse.<AccountDTO>builder()
                .code(HttpStatus.OK.value())
                .message("Get current account successfully")
                .data(account)
                .build();
    }

    @Operation(summary = "Get account by ID", description = "Retrieve a specific account by its ID")
    @GetMapping("/{id}")
    public ApiResponse<AccountDTO> getAccountById(@Parameter(description = "Account ID") @PathVariable Long id) {
        AccountDTO account = accountService.getAccountById(id);
        return ApiResponse.<AccountDTO>builder()
                .code(HttpStatus.OK.value())
                .message("Get account successfully")
                .data(account)
                .build();
    }

    @Operation(summary = "Update current account", description = "Update the currently authenticated user's account information")
    @PutMapping("/me")
    public ApiResponse<AccountDTO> updateCurrentAccount(@Valid @RequestBody AccountUpdateRequest request) {
        Long accountId = SecurityUtils.getCurrentAccountId();
        AccountDTO account = accountService.updateAccount(accountId, request);
        return ApiResponse.<AccountDTO>builder()
                .code(HttpStatus.OK.value())
                .message("Update account successfully")
                .data(account)
                .build();
    }

    @Operation(summary = "Update account by ID", description = "Update a specific account by its ID (Admin only)")
    @PutMapping("/{id}")
    public ApiResponse<AccountDTO> updateAccount(
            @Parameter(description = "Account ID") @PathVariable Long id,
            @Valid @RequestBody AccountUpdateRequest request) {
        AccountDTO account = accountService.updateAccount(id, request);
        return ApiResponse.<AccountDTO>builder()
                .code(HttpStatus.OK.value())
                .message("Update account successfully")
                .data(account)
                .build();
    }
}
