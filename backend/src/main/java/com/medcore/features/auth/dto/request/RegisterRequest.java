package com.medcore.features.auth.dto.request;

import com.medcore.features.patient.enums.BloodGroup;
import com.medcore.features.user.enums.Gender;
import com.medcore.features.user.enums.MaritalStatus;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class RegisterRequest {

    // User information

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^[6-9]\\d{9}$",
            message = "Invalid Indian phone number"
    )
    private String phone;

    @NotBlank(message = "Password is required")
    @Size(
            min = 8,
            max = 20,
            message = "Password must be between 8 and 20 characters"
    )
    private String password;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;

    private String city;

    private String state;

    private String pincode;

    private String occupation;

    private Gender gender;

    private MaritalStatus maritalStatus;


    // Patient information

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @NotNull(message = "Blood group is required")
    private BloodGroup bloodGroup;

    @NotBlank(message = "Emergency contact name is required")
    private String emergencyContactName;

    @NotBlank(message = "Emergency contact relation is required")
    private String emergencyContactRelation;

    @NotBlank(message = "Emergency contact phone is required")
    @Pattern(
            regexp = "^[6-9]\\d{9}$",
            message = "Invalid Indian phone number"
    )
    private String emergencyContactPhone;

    private List<String> allergies;

    private List<String> chronicConditions;
}