package com.travelplan.api.trip.dto;

public record ChecklistItemResponse(
        Long id,
        String title,
        String category,
        Boolean isChecked
) {
}
