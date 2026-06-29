package com.travelplan.api.trip.dto;

import java.time.LocalDate;
import java.util.List;

public record ItineraryDayResponse(
        Long id,
        Integer dayNumber,
        LocalDate date,
        List<ItineraryItemResponse> items
) {
}
