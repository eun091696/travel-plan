package com.travelplan.api.trip;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, Long> {
    List<ChecklistItem> findByTripId(Long tripId);
}
