package com.travelplan.api.trip;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByUserMockUserIdOrderByCreatedAtDesc(String mockUserId);

    Optional<Trip> findByIdAndUserMockUserId(Long id, String mockUserId);

    boolean existsByIdAndUserMockUserId(Long id, String mockUserId);
}
