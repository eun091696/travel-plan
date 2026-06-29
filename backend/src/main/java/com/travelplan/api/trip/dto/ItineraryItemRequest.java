package com.travelplan.api.trip.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record ItineraryItemRequest(
        @NotNull @Min(1) Integer dayNumber,
        LocalDate date,
        @NotNull LocalTime time,
        @NotBlank @Size(max = 120) String title,
        @Size(max = 1000) String description,
        @Size(max = 60) String category,
        @Size(max = 160) String placeName,
        @Size(max = 240) String address,
        @DecimalMin("-90.0") @DecimalMax("90.0") BigDecimal latitude,
        @DecimalMin("-180.0") @DecimalMax("180.0") BigDecimal longitude,
        @Min(0) Integer sortOrder,
        Boolean isCompleted
) {
}
