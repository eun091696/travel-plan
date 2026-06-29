package com.travelplan.api.trip;

import com.travelplan.api.trip.dto.ChecklistItemRequest;
import com.travelplan.api.trip.dto.ChecklistItemResponse;
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
public class ChecklistController {
    private final ChecklistService checklistService;

    public ChecklistController(ChecklistService checklistService) {
        this.checklistService = checklistService;
    }

    @GetMapping("/trips/{tripId}/checklists")
    public List<ChecklistItemResponse> getChecklistItems(
            @PathVariable Long tripId,
            @RequestHeader(value = "X-Mock-User-Id", required = false) String headerUserId,
            @RequestParam(value = "userId", required = false) String queryUserId
    ) {
        return checklistService.getChecklistItems(tripId, resolveUserId(headerUserId, queryUserId));
    }

    @PostMapping("/trips/{tripId}/checklists")
    public ResponseEntity<ChecklistItemResponse> createChecklistItem(
            @PathVariable Long tripId,
            @RequestHeader(value = "X-Mock-User-Id", required = false) String headerUserId,
            @RequestParam(value = "userId", required = false) String queryUserId,
            @Valid @RequestBody ChecklistItemRequest request
    ) {
        ChecklistItemResponse response = checklistService.createChecklistItem(tripId, resolveUserId(headerUserId, queryUserId), request);
        return ResponseEntity.created(URI.create("/api/checklists/" + response.id())).body(response);
    }

    @PutMapping("/checklists/{checklistId}")
    public ChecklistItemResponse updateChecklistItem(
            @PathVariable Long checklistId,
            @RequestHeader(value = "X-Mock-User-Id", required = false) String headerUserId,
            @RequestParam(value = "userId", required = false) String queryUserId,
            @Valid @RequestBody ChecklistItemRequest request
    ) {
        return checklistService.updateChecklistItem(checklistId, resolveUserId(headerUserId, queryUserId), request);
    }

    @DeleteMapping("/checklists/{checklistId}")
    public ResponseEntity<Void> deleteChecklistItem(
            @PathVariable Long checklistId,
            @RequestHeader(value = "X-Mock-User-Id", required = false) String headerUserId,
            @RequestParam(value = "userId", required = false) String queryUserId
    ) {
        checklistService.deleteChecklistItem(checklistId, resolveUserId(headerUserId, queryUserId));
        return ResponseEntity.noContent().build();
    }

    private String resolveUserId(String headerUserId, String queryUserId) {
        return headerUserId != null && !headerUserId.isBlank() ? headerUserId : queryUserId;
    }
}
