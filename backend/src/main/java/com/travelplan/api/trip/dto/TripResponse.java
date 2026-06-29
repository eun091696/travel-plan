package com.travelplan.api.trip.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TripResponse(
        Long id,
        String userId,
        String title,
        String destination,
        LocalDate startDate,
        LocalDate endDate,
        LocalDateTime arrivalDateTime,
        LocalDateTime departureDateTime,
        BigDecimal totalBudget,
        BigDecimal budget,
        String companion,
        String travelStyle,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
