package com.travelplan.api.trip;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItineraryDayRepository extends JpaRepository<ItineraryDay, Long> {
    List<ItineraryDay> findByTripIdOrderByDayNumberAsc(Long tripId);

    Optional<ItineraryDay> findByTripIdAndDayNumber(Long tripId, Integer dayNumber);
}
