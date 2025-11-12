package az.schedule.backendservice.repository.criteria;

import az.schedule.backendservice.entity.Account;
import jakarta.persistence.criteria.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.function.Consumer;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AccountCriteriaQueryConsumer implements Consumer<SearchCriteria> {
    private CriteriaBuilder builder;
    private Predicate predicate;
    private Root<Account> root;

    @Override
    public void accept(SearchCriteria param) {
        if (param.getValue() != null ){
            if(param.getKey().equals("isActive")) {
                predicate = builder.and(predicate, builder.equal(root.get(param.getKey()), param.getValue().equals("true")));
            } else {
                if (param.getOperation().equals(">")) {
                    predicate = builder.and(
                            predicate,
                            builder.greaterThanOrEqualTo(
                                    root.get(param.getKey()), param.getValue().toString()));
                } else if (param.getOperation().equals("<")) {
                    predicate = builder.and(
                            predicate,
                            builder.lessThanOrEqualTo(
                                    root.get(param.getKey()), param.getValue().toString()));
                } else {
                    if (param.getValue().getClass() == String.class) {
                        predicate = builder.and(
                                predicate,
                                builder.like(
                                        root.get(param.getKey()), "%" + param.getValue().toString() + "%"));
                    } else {
                        predicate = builder.and(predicate, builder.equal(root.get(param.getKey()), param.getValue()));
                    }
                }
            }
        }
    }
}
