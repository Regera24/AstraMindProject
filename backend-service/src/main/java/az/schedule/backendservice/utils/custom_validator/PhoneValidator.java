package az.schedule.backendservice.utils.custom_validator;

import az.schedule.backendservice.utils.custom_constraint.PhoneConstraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PhoneValidator implements ConstraintValidator<PhoneConstraint, String> {
    @Override
    public void initialize(PhoneConstraint phoneConstraint) {
        ConstraintValidator.super.initialize(phoneConstraint);
    }

    @Override
    public boolean isValid(String phone, ConstraintValidatorContext constraintValidatorContext) {
        if(phone==null)
            return false;
        return phone.matches("^(03|05|07|08|09)\\d{8}$");
    }
}
