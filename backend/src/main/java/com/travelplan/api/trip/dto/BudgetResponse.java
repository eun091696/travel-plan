package com.travelplan.api.trip.dto;

import java.math.BigDecimal;

public record BudgetResponse(
        Long id,
        String category,
        String title,
        BigDecimal plannedAmount,
        BigDecimal actualAmount,
        String memo
) {
}
