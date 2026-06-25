import { getItineraryMapData } from '../data/mockCoordinates';

export const mapDayColors = ['#176b55', '#ff8a5b', '#5b7cfa', '#9b59b6', '#d48b2f'];

export function getMapDataForPlan(plan) {
  return getItineraryMapData(plan);
}

export function getSelectedMapDay(mapData, selectedDay) {
  return mapData.days.find((day) => day.day === selectedDay) || mapData.days[0] || null;
}

export function getMapPointsForDay(day, dayIndex = 0) {
  if (!day) return [];

  return day.points.map((point) => ({
    ...point,
    color: mapDayColors[dayIndex % mapDayColors.length],
  }));
}

export function getDayColor(dayIndex) {
  return mapDayColors[dayIndex % mapDayColors.length];
}

// Later replacement point:
// Replace getMapDataForPlan with a Google Maps Places/Directions backed adapter
// while keeping the ItineraryMapView component API unchanged.
