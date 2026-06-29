package com.travelplan.api.trip.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TripRequest(
        @NotBlank @Size(max = 120) String title,
        @NotBlank @Size(max = 80) String destination,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        LocalDateTime arrivalDateTime,
        LocalDateTime departureDateTime,
        @DecimalMin(value = "0.0", inclusive = true) BigDecimal totalBudget,
        @DecimalMin(value = "0.0", inclusive = true) BigDecimal budget,
        @Size(max = 80) String companion,
        @Size(max = 80) String travelStyle
) {
}
