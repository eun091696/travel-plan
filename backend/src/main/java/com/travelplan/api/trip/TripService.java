package com.travelplan.api.trip;

import com.travelplan.api.user.MockUserService;
import com.travelplan.api.user.User;
import com.travelplan.api.trip.dto.TripRequest;
import com.travelplan.api.trip.dto.TripResponse;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class TripService {
    private final TripRepository tripRepository;
    private final MockUserService mockUserService;

    public TripService(TripRepository tripRepository, MockUserService mockUserService) {
        this.tripRepository = tripRepository;
        this.mockUserService = mockUserService;
    }

    public List<TripResponse> getTrips(String mockUserId) {
        String resolvedMockUserId = mockUserService.resolveMockUserId(mockUserId);
        return tripRepository.findByUserMockUserIdOrderByCreatedAtDesc(resolvedMockUserId).stream()
                .map(this::toResponse)
                .toList();
    }

    public TripResponse getTripById(Long id, String mockUserId) {
        return toResponse(findTrip(id, mockUserId));
    }

    @Transactional
    public TripResponse createTrip(String mockUserId, TripRequest request) {
        validateDateRange(request);
        User user = mockUserService.getOrCreateUser(mockUserId);
        Trip trip = new Trip();
        trip.setUser(user);
        applyRequest(trip, request);
        return toResponse(tripRepository.save(trip));
    }

    @Transactional
    public TripResponse updateTrip(Long id, String mockUserId, TripRequest request) {
        validateDateRange(request);
        Trip trip = findTrip(id, mockUserId);
        applyRequest(trip, request);
        return toResponse(trip);
    }

    @Transactional
    public void deleteTrip(Long id, String mockUserId) {
        Trip trip = findTrip(id, mockUserId);
        tripRepository.delete(trip);
    }

    private Trip findTrip(Long id, String mockUserId) {
        String resolvedMockUserId = mockUserService.resolveMockUserId(mockUserId);
        return tripRepository.findByIdAndUserMockUserId(id, resolvedMockUserId)
                .orElseThrow(() -> new TripNotFoundException(id));
    }

    private void validateDateRange(TripRequest request) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new IllegalArgumentException("endDate must be on or after startDate.");
        }
        if (request.arrivalDateTime() != null && request.departureDateTime() != null
                && request.departureDateTime().isBefore(request.arrivalDateTime())) {
            throw new IllegalArgumentException("departureDateTime must be on or after arrivalDateTime.");
        }
    }

    private void applyRequest(Trip trip, TripRequest request) {
        trip.setTitle(request.title());
        trip.setDestination(request.destination());
        trip.setStartDate(request.startDate());
        trip.setEndDate(request.endDate());
        trip.setArrivalDateTime(request.arrivalDateTime());
        trip.setDepartureDateTime(request.departureDateTime());
        trip.setTotalBudget(resolveTotalBudget(request));
        trip.setCompanion(request.companion());
        trip.setTravelStyle(request.travelStyle());
    }

    private BigDecimal resolveTotalBudget(TripRequest request) {
        return request.totalBudget() != null ? request.totalBudget() : request.budget();
    }

    private TripResponse toResponse(Trip trip) {
        BigDecimal totalBudget = trip.getTotalBudget();
        return new TripResponse(
                trip.getId(),
                trip.getUser().getMockUserId(),
                trip.getTitle(),
                trip.getDestination(),
                trip.getStartDate(),
                trip.getEndDate(),
                trip.getArrivalDateTime(),
                trip.getDepartureDateTime(),
                totalBudget,
                totalBudget,
                trip.getCompanion(),
                trip.getTravelStyle(),
                trip.getCreatedAt(),
                trip.getUpdatedAt()
        );
    }
}
