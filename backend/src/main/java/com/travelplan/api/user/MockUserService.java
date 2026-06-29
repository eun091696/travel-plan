package com.travelplan.api.user;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MockUserService {
    public static final String DEFAULT_MOCK_USER_ID = "mock-user-1";

    private final UserRepository userRepository;

    public MockUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User getOrCreateUser(String mockUserId) {
        String resolvedMockUserId = resolveMockUserId(mockUserId);
        return userRepository.findByMockUserId(resolvedMockUserId)
                .orElseGet(() -> createMockUser(resolvedMockUserId));
    }

    public String resolveMockUserId(String mockUserId) {
        if (mockUserId == null || mockUserId.isBlank()) {
            return DEFAULT_MOCK_USER_ID;
        }
        return mockUserId.trim();
    }

    private User createMockUser(String mockUserId) {
        User user = new User();
        user.setMockUserId(mockUserId);
        user.setName("Mock User");
        user.setEmail(mockUserId + "@mock.travel-plan.local");
        return userRepository.save(user);
    }
}
