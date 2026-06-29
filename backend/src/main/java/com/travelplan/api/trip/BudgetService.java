package com.travelplan.api.trip;

import com.travelplan.api.common.ResourceNotFoundException;
import com.travelplan.api.trip.dto.BudgetRequest;
import com.travelplan.api.trip.dto.BudgetResponse;
import com.travelplan.api.user.MockUserService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class BudgetService {
    private final TripRepository tripRepository;
    private final BudgetRepository budgetRepository;
    private final MockUserService mockUserService;

    public BudgetService(TripRepository tripRepository, BudgetRepository budgetRepository, MockUserService mockUserService) {
        this.tripRepository = tripRepository;
        this.budgetRepository = budgetRepository;
        this.mockUserService = mockUserService;
    }

    public List<BudgetResponse> getBudgets(Long tripId, String mockUserId) {
        ensureTripExists(tripId, mockUserId);
        return budgetRepository.findByTripId(tripId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public BudgetResponse createBudget(Long tripId, String mockUserId, BudgetRequest request) {
        Budget budget = new Budget();
        budget.setTrip(findTrip(tripId, mockUserId));
        applyRequest(budget, request);
        return toResponse(budgetRepository.save(budget));
    }

    @Transactional
    public BudgetResponse updateBudget(Long budgetId, String mockUserId, BudgetRequest request) {
        Budget budget = findBudget(budgetId, mockUserId);
        applyRequest(budget, request);
        return toResponse(budget);
    }

    @Transactional
    public void deleteBudget(Long budgetId, String mockUserId) {
        budgetRepository.delete(findBudget(budgetId, mockUserId));
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

    private Budget findBudget(Long budgetId, String mockUserId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", budgetId));
        if (!budget.getTrip().getUser().getMockUserId().equals(mockUserService.resolveMockUserId(mockUserId))) {
            throw new ResourceNotFoundException("Budget", budgetId);
        }
        return budget;
    }

    private void applyRequest(Budget budget, BudgetRequest request) {
        budget.setCategory(request.category());
        budget.setTitle(request.title());
        budget.setPlannedAmount(request.plannedAmount());
        budget.setActualAmount(request.actualAmount());
        budget.setMemo(request.memo());
    }

    private BudgetResponse toResponse(Budget budget) {
        return new BudgetResponse(
                budget.getId(),
                budget.getCategory(),
                budget.getTitle(),
                budget.getPlannedAmount(),
                budget.getActualAmount(),
                budget.getMemo()
        );
    }
}
