package com.travelplan.api.trip.dto;

import java.math.BigDecimal;
import java.time.LocalTime;

public record ItineraryItemResponse(
        Long id,
        LocalTime time,
        String title,
        String description,
        String category,
        String placeName,
        String address,
        BigDecimal latitude,
        BigDecimal longitude,
        Integer sortOrder,
        Boolean isCompleted
) {
}
