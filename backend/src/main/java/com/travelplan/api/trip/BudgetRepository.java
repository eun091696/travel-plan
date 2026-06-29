package com.travelplan.api.trip;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByTripId(Long tripId);
}
