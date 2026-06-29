package com.travelplan.api.trip;

import com.travelplan.api.user.MockUserService;
import com.travelplan.api.common.ResourceNotFoundException;
import com.travelplan.api.trip.dto.ItineraryDayResponse;
import com.travelplan.api.trip.dto.ItineraryItemRequest;
import com.travelplan.api.trip.dto.ItineraryItemResponse;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ItineraryService {
    private final TripRepository tripRepository;
    private final ItineraryDayRepository itineraryDayRepository;
    private final ItineraryItemRepository itineraryItemRepository;
    private final MockUserService mockUserService;

    public ItineraryService(
            TripRepository tripRepository,
            ItineraryDayRepository itineraryDayRepository,
            ItineraryItemRepository itineraryItemRepository,
            MockUserService mockUserService
    ) {
        this.tripRepository = tripRepository;
        this.itineraryDayRepository = itineraryDayRepository;
        this.itineraryItemRepository = itineraryItemRepository;
        this.mockUserService = mockUserService;
    }

    public List<ItineraryDayResponse> getItinerary(Long tripId, String mockUserId) {
        ensureTripExists(tripId, mockUserId);
        return itineraryDayRepository.findByTripIdOrderByDayNumberAsc(tripId).stream()
                .map(this::toDayResponse)
                .toList();
    }

    @Transactional
    public ItineraryItemResponse createItem(Long tripId, String mockUserId, ItineraryItemRequest request) {
        Trip trip = findTrip(tripId, mockUserId);
        ItineraryDay day = itineraryDayRepository.findByTripIdAndDayNumber(tripId, request.dayNumber())
                .orElseGet(() -> createDay(trip, request));
        ItineraryItem item = new ItineraryItem();
        item.setItineraryDay(day);
        applyRequest(item, request);
        return toItemResponse(itineraryItemRepository.save(item));
    }

    @Transactional
    public ItineraryItemResponse updateItem(Long itemId, String mockUserId, ItineraryItemRequest request) {
        ItineraryItem item = findItem(itemId, mockUserId);
        item.setItineraryDay(resolveDayForUpdate(item, request));
        applyRequest(item, request);
        return toItemResponse(item);
    }

    @Transactional
    public void deleteItem(Long itemId, String mockUserId) {
        itineraryItemRepository.delete(findItem(itemId, mockUserId));
    }

    private ItineraryDay createDay(Trip trip, ItineraryItemRequest request) {
        ItineraryDay day = new ItineraryDay();
        day.setTrip(trip);
        day.setDayNumber(request.dayNumber());
        day.setDate(request.date() != null ? request.date() : trip.getStartDate().plusDays(request.dayNumber() - 1L));
        return itineraryDayRepository.save(day);
    }

    private ItineraryDay resolveDayForUpdate(ItineraryItem item, ItineraryItemRequest request) {
        ItineraryDay currentDay = item.getItineraryDay();
        if (currentDay.getDayNumber().equals(request.dayNumber())) {
            if (request.date() != null) {
                currentDay.setDate(request.date());
            }
            return currentDay;
        }

        Trip trip = currentDay.getTrip();
        return itineraryDayRepository.findByTripIdAndDayNumber(trip.getId(), request.dayNumber())
                .orElseGet(() -> createDay(trip, request));
    }

    private Trip findTrip(Long tripId, String mockUserId) {
        return tripRepository.findByIdAndUserMockUserId(tripId, mockUserService.resolveMockUserId(mockUserId))
                .orElseThrow(() -> new TripNotFoundException(tripId));
    }

    private void ensureTripExists(Long tripId, String mockUserId) {
        if (!tripRepository.existsByIdAndUserMockUserId(tripId, mockUserService.resolveMockUserId(mockUserId))) {
            throw new TripNotFoundException(tripId);
        }
    }

    private ItineraryItem findItem(Long itemId, String mockUserId) {
        ItineraryItem item = itineraryItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary item", itemId));
        if (!item.getItineraryDay().getTrip().getUser().getMockUserId().equals(mockUserService.resolveMockUserId(mockUserId))) {
            throw new ResourceNotFoundException("Itinerary item", itemId);
        }
        return item;
    }

    private void applyRequest(ItineraryItem item, ItineraryItemRequest request) {
        item.setTime(request.time());
        item.setTitle(request.title());
        item.setDescription(request.description());
        item.setCategory(request.category());
        item.setPlaceName(request.placeName());
        item.setAddress(request.address());
        item.setLatitude(request.latitude());
        item.setLongitude(request.longitude());
        item.setSortOrder(request.sortOrder() != null ? request.sortOrder() : 0);
        item.setCompleted(Boolean.TRUE.equals(request.isCompleted()));
    }

    private ItineraryDayResponse toDayResponse(ItineraryDay day) {
        List<ItineraryItemResponse> items = day.getItems().stream()
                .sorted(Comparator.comparing(ItineraryItem::getSortOrder).thenComparing(ItineraryItem::getTime))
                .map(this::toItemResponse)
                .toList();
        return new ItineraryDayResponse(day.getId(), day.getDayNumber(), day.getDate(), items);
    }

    private ItineraryItemResponse toItemResponse(ItineraryItem item) {
        return new ItineraryItemResponse(
                item.getId(),
                item.getTime(),
                item.getTitle(),
                item.getDescription(),
                item.getCategory(),
                item.getPlaceName(),
                item.getAddress(),
                item.getLatitude(),
                item.getLongitude(),
                item.getSortOrder(),
                item.isCompleted()
        );
    }
}
