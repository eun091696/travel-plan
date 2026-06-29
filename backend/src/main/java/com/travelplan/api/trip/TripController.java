package com.travelplan.api.trip;

import com.travelplan.api.trip.dto.TripRequest;
import com.travelplan.api.trip.dto.TripResponse;
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
@RequestMapping("/api/trips")
public class TripController {
    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @GetMapping
    public List<TripResponse> getTrips(
            @RequestHeader(value = "X-Mock-User-Id", required = false) String headerUserId,
            @RequestParam(value = "userId", required = false) String queryUserId
    ) {
        return tripService.getTrips(resolveUserId(headerUserId, queryUserId));
    }

    @GetMapping("/{id}")
    public TripResponse getTripById(
            @PathVariable Long id,
            @RequestHeader(value = "X-Mock-User-Id", required = false) String headerUserId,
            @RequestParam(value = "userId", required = false) String queryUserId
    ) {
        return tripService.getTripById(id, resolveUserId(headerUserId, queryUserId));
    }

    @PostMapping
    public ResponseEntity<TripResponse> createTrip(
            @RequestHeader(value = "X-Mock-User-Id", required = false) String headerUserId,
            @RequestParam(value = "userId", required = false) String queryUserId,
            @Valid @RequestBody TripRequest request
    ) {
        TripResponse response = tripService.createTrip(resolveUserId(headerUserId, queryUserId), request);
        return ResponseEntity.created(URI.create("/api/trips/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public TripResponse updateTrip(
            @PathVariable Long id,
            @RequestHeader(value = "X-Mock-User-Id", required = false) String headerUserId,
            @RequestParam(value = "userId", required = false) String queryUserId,
            @Valid @RequestBody TripRequest request
    ) {
        return tripService.updateTrip(id, resolveUserId(headerUserId, queryUserId), request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(
            @PathVariable Long id,
            @RequestHeader(value = "X-Mock-User-Id", required = false) String headerUserId,
            @RequestParam(value = "userId", required = false) String queryUserId
    ) {
        tripService.deleteTrip(id, resolveUserId(headerUserId, queryUserId));
        return ResponseEntity.noContent().build();
    }

    private String resolveUserId(String headerUserId, String queryUserId) {
        return headerUserId != null && !headerUserId.isBlank() ? headerUserId : queryUserId;
    }
}
