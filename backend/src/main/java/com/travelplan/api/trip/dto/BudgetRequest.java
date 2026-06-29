package com.travelplan.api.trip.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record BudgetRequest(
        @NotBlank @Size(max = 60) String category,
        @NotBlank @Size(max = 120) String title,
        @DecimalMin(value = "0.0", inclusive = true) BigDecimal plannedAmount,
        @DecimalMin(value = "0.0", inclusive = true) BigDecimal actualAmount,
        @Size(max = 500) String memo
) {
}
