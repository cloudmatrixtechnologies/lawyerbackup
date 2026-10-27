package com.portal.lawyer.booking;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Body of the public contact form. {@code website} is a honeypot field. */
public record BookingRequest(
        @NotBlank(message = "Please enter your name.")
        @Size(max = 100, message = "Name is too long.")
        String name,

        @NotBlank(message = "Please enter your phone number.")
        @Pattern(regexp = "^[+\\d][\\d\\s-]{7,18}$", message = "Please enter a valid phone number.")
        String phone,

        @Email(message = "Please enter a valid email address.")
        @Size(max = 120, message = "Email is too long.")
        String email,

        @Size(max = 80)
        String area,

        @Size(max = 2000, message = "Description is too long (max 2000 characters).")
        String message,

        String website
) {
}
