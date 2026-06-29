package com.travelplan.api.trip;

import com.travelplan.api.common.ResourceNotFoundException;

public class TripNotFoundException extends ResourceNotFoundException {
    public TripNotFoundException(Long id) {
        super("Trip", id);
    }
}
