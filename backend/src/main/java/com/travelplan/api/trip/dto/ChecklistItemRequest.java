package com.travelplan.api.trip.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChecklistItemRequest(
        @NotBlank @Size(max = 120) String title,
        @Size(max = 60) String category,
        Boolean isChecked
) {
}
