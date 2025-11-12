package az.schedule.backendservice.service;

import az.schedule.backendservice.dto.AccountDTO;
import az.schedule.backendservice.dto.request.account.AccountUpdateRequest;
import az.schedule.backendservice.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public interface AccountService {
    AccountDTO getAccountById(Long id);
    
    AccountDTO getAccountByEmail(String email);
    
    AccountDTO getAccountByUsername(String username);
    
    AccountDTO updateAccount(Long id, AccountUpdateRequest request);
    
    void deleteAccount(Long id);
    
    PageResponse<AccountDTO> searchAccounts(String keyword, Pageable pageable);
    
    AccountDTO getCurrentAccount();

    PageResponse<AccountDTO> getNewsArticlesByCriteria(int offset, int pageSize, String sort, String... searchs);
}
