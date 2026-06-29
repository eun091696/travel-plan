import { itineraryService } from '../services/itineraryService';

export function generateItinerary(destination, form) {
  return itineraryService.generateItinerary({
    destination,
    startDate: form.startDate,
    endDate: form.endDate,
    arrivalTime: form.arrivalTime,
    departureTime: form.departureTime,
    budget: form.budget,
    companions: form.companions,
    style: form.style,
  });
}
