package com.travelplan.api.trip;

import com.travelplan.api.trip.dto.ItineraryDayResponse;
import com.travelplan.api.trip.dto.ItineraryItemRequest;
import com.travelplan.api.trip.dto.ItineraryItemResponse;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ItineraryController {
    private final ItineraryService itineraryService;

    public ItineraryController(ItineraryService itineraryService) {
        this.itineraryService = itineraryService;
    }

    @GetMapping("/trips/{tripId}/itinerary")
    public List<ItineraryDayResponse> getItinerary(
            @PathVariable Long tripId,
            @RequestHeader(value = "X-Mock-User-Id", required = false) String headerUserId,
            @RequestParam(value = "userId", required = false) String queryUserId
    ) {
        return itineraryService.getItinerary(tripId, resolveUserId(headerUserId, queryUserId));
    }

    @PostMapping("/trips/{tripId}/itinerary/items")
    public ResponseEntity<ItineraryItemResponse> createItem(
            @PathVariable Long tripId,
            @RequestHeader(value = "X-Mock-User-Id", required = false) String headerUserId,
            @RequestParam(value = "userId", required = false) String queryUserId,
            @Valid @RequestBody ItineraryItemRequest request
    ) {
        ItineraryItemResponse response = itineraryService.createItem(tripId, resolveUserId(headerUserId, queryUserId), request);
        return ResponseEntity.created(URI.create("/api/itinerary/items/" + response.id())).body(response);
    }

    @PutMapping("/itinerary/items/{itemId}")
    public ItineraryItemResponse updateItem(
            @PathVariable Long itemId,
            @RequestHeader(value = "X-Mock-User-Id", required = false) String headerUserId,
            @RequestParam(value = "userId", required = false) String queryUserId,
            @Valid @RequestBody ItineraryItemRequest request
    ) {
        return itineraryService.updateItem(itemId, resolveUserId(headerUserId, queryUserId), request);
    }

    @DeleteMapping("/itinerary/items/{itemId}")
    public ResponseEntity<Void> deleteItem(
            @PathVariable Long itemId,
            @RequestHeader(value = "X-Mock-User-Id", required = false) String headerUserId,
            @RequestParam(value = "userId", required = false) String queryUserId
    ) {
        itineraryService.deleteItem(itemId, resolveUserId(headerUserId, queryUserId));
        return ResponseEntity.noContent().build();
    }

    private String resolveUserId(String headerUserId, String queryUserId) {
        return headerUserId != null && !headerUserId.isBlank() ? headerUserId : queryUserId;
    }
}
