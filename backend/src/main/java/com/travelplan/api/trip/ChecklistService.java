package com.travelplan.api.trip;

import com.travelplan.api.common.ResourceNotFoundException;
import com.travelplan.api.trip.dto.ChecklistItemRequest;
import com.travelplan.api.trip.dto.ChecklistItemResponse;
import com.travelplan.api.user.MockUserService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ChecklistService {
    private final TripRepository tripRepository;
    private final ChecklistItemRepository checklistItemRepository;
    private final MockUserService mockUserService;

    public ChecklistService(TripRepository tripRepository, ChecklistItemRepository checklistItemRepository, MockUserService mockUserService) {
        this.tripRepository = tripRepository;
        this.checklistItemRepository = checklistItemRepository;
        this.mockUserService = mockUserService;
    }

    public List<ChecklistItemResponse> getChecklistItems(Long tripId, String mockUserId) {
        ensureTripExists(tripId, mockUserId);
        return checklistItemRepository.findByTripId(tripId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ChecklistItemResponse createChecklistItem(Long tripId, String mockUserId, ChecklistItemRequest request) {
        ChecklistItem item = new ChecklistItem();
        item.setTrip(findTrip(tripId, mockUserId));
        applyRequest(item, request);
        return toResponse(checklistItemRepository.save(item));
    }

    @Transactional
    public ChecklistItemResponse updateChecklistItem(Long checklistId, String mockUserId, ChecklistItemRequest request) {
        ChecklistItem item = findChecklistItem(checklistId, mockUserId);
        applyRequest(item, request);
        return toResponse(item);
    }

    @Transactional
    public void deleteChecklistItem(Long checklistId, String mockUserId) {
        checklistItemRepository.delete(findChecklistItem(checklistId, mockUserId));
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

    private ChecklistItem findChecklistItem(Long checklistId, String mockUserId) {
        ChecklistItem item = checklistItemRepository.findById(checklistId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist item", checklistId));
        if (!item.getTrip().getUser().getMockUserId().equals(mockUserService.resolveMockUserId(mockUserId))) {
            throw new ResourceNotFoundException("Checklist item", checklistId);
        }
        return item;
    }

    private void applyRequest(ChecklistItem item, ChecklistItemRequest request) {
        item.setTitle(request.title());
        item.setCategory(request.category());
        item.setChecked(Boolean.TRUE.equals(request.isChecked()));
    }

    private ChecklistItemResponse toResponse(ChecklistItem item) {
        return new ChecklistItemResponse(
                item.getId(),
                item.getTitle(),
                item.getCategory(),
                item.isChecked()
        );
    }
}
