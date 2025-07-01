/**
 * Test script for route deviation detection
 * This script simulates different scenarios to test the deviation detection system
 */

import { Alert } from 'react-native';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface TestScenario {
  name: string;
  description: string;
  currentPosition: Coordinate;
  routePoints: Coordinate[];
  expectedBehavior: string;
}

// Sample route points (you can replace these with actual route data)
const sampleRoutePoints: Coordinate[] = [
  { latitude: 42.692865, longitude: 23.334036 }, // Starting point
  { latitude: 42.693000, longitude: 23.334500 },
  { latitude: 42.693500, longitude: 23.335000 },
  { latitude: 42.694000, longitude: 23.335500 },
  { latitude: 42.694500, longitude: 23.336000 },
  { latitude: 42.695000, longitude: 23.336500 }, // End point
];

// Test scenarios
const testScenarios: TestScenario[] = [
  {
    name: "On Route",
    description: "Driver is following the planned route",
    currentPosition: { latitude: 42.693000, longitude: 23.334500 },
    routePoints: sampleRoutePoints,
    expectedBehavior: "No deviation alert should appear"
  },
  {
    name: "Minor Deviation",
    description: "Driver is slightly off route (within 100m threshold)",
    currentPosition: { latitude: 42.693100, longitude: 23.334600 },
    routePoints: sampleRoutePoints,
    expectedBehavior: "Warning alert should appear but no recalculation"
  },
  {
    name: "Major Deviation",
    description: "Driver is significantly off route (beyond 500m threshold)",
    currentPosition: { latitude: 42.700000, longitude: 23.350000 },
    routePoints: sampleRoutePoints,
    expectedBehavior: "Deviation alert should appear and route should be recalculated"
  },
  {
    name: "Edge Case - Just Below Recalculation Threshold",
    description: "Driver is 499m away from route",
    currentPosition: { latitude: 42.697000, longitude: 23.339000 },
    routePoints: sampleRoutePoints,
    expectedBehavior: "Warning alert should appear but no recalculation"
  },
  {
    name: "Edge Case - Just Above Recalculation Threshold",
    description: "Driver is 501m away from route",
    currentPosition: { latitude: 42.697500, longitude: 23.339500 },
    routePoints: sampleRoutePoints,
    expectedBehavior: "Deviation alert should appear and route should be recalculated"
  }
];

// Function to calculate distance between two coordinates (same as in the main app)
const calculateDistance = (coord1: Coordinate, coord2: Coordinate): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = coord1.latitude * Math.PI / 180;
  const φ2 = coord2.latitude * Math.PI / 180;
  const Δφ = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const Δλ = (coord2.longitude - coord1.longitude) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

// Function to find closest route point
const findClosestRoutePoint = (currentPos: Coordinate, routePoints: Coordinate[]): { distance: number, index: number } => {
  let minDistance = Infinity;
  let closestIndex = 0;

  routePoints.forEach((point, index) => {
    const distance = calculateDistance(currentPos, point);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });

  return { distance: minDistance, index: closestIndex };
};

// Function to run a test scenario
export const runTestScenario = (scenarioIndex: number): void => {
  if (scenarioIndex < 0 || scenarioIndex >= testScenarios.length) {
    Alert.alert("Test Error", "Invalid scenario index");
    return;
  }

  const scenario = testScenarios[scenarioIndex];
  const { distance } = findClosestRoutePoint(scenario.currentPosition, scenario.routePoints);
  
  const DEVIATION_THRESHOLD_METERS = 100;
  const MAX_DEVIATION_METERS = 500;

  let alertMessage = `Test: ${scenario.name}\n\n`;
  alertMessage += `Description: ${scenario.description}\n\n`;
  alertMessage += `Current Position: ${scenario.currentPosition.latitude.toFixed(6)}, ${scenario.currentPosition.longitude.toFixed(6)}\n`;
  alertMessage += `Distance from route: ${distance.toFixed(2)} meters\n\n`;

  if (distance > MAX_DEVIATION_METERS) {
    alertMessage += `RESULT: MAJOR DEVIATION DETECTED\n`;
    alertMessage += `Expected: ${scenario.expectedBehavior}\n`;
    alertMessage += `Action: Route should be recalculated`;
  } else if (distance > DEVIATION_THRESHOLD_METERS) {
    alertMessage += `RESULT: MINOR DEVIATION DETECTED\n`;
    alertMessage += `Expected: ${scenario.expectedBehavior}\n`;
    alertMessage += `Action: Warning should be shown`;
  } else {
    alertMessage += `RESULT: ON ROUTE\n`;
    alertMessage += `Expected: ${scenario.expectedBehavior}\n`;
    alertMessage += `Action: No alert should appear`;
  }

  Alert.alert("Route Deviation Test", alertMessage);
};

// Function to run all test scenarios
export const runAllTests = (): void => {
  let testResults = "ROUTE DEVIATION TEST RESULTS\n\n";
  
  testScenarios.forEach((scenario, index) => {
    const { distance } = findClosestRoutePoint(scenario.currentPosition, scenario.routePoints);
    const DEVIATION_THRESHOLD_METERS = 100;
    const MAX_DEVIATION_METERS = 500;

    testResults += `${index + 1}. ${scenario.name}\n`;
    testResults += `   Distance: ${distance.toFixed(2)}m\n`;
    
    if (distance > MAX_DEVIATION_METERS) {
      testResults += `   Status: MAJOR DEVIATION (Recalculation needed)\n`;
    } else if (distance > DEVIATION_THRESHOLD_METERS) {
      testResults += `   Status: MINOR DEVIATION (Warning needed)\n`;
    } else {
      testResults += `   Status: ON ROUTE (No action needed)\n`;
    }
    testResults += `   Expected: ${scenario.expectedBehavior}\n\n`;
  });

  Alert.alert("All Test Results", testResults);
};

// Function to get test scenarios for UI display
export const getTestScenarios = (): TestScenario[] => {
  return testScenarios;
};

// Function to simulate position updates for testing
export const simulatePositionUpdate = (
  currentPosition: Coordinate,
  routePoints: Coordinate[],
  onDeviationDetected: (distance: number, shouldRecalculate: boolean) => void
): void => {
  const { distance } = findClosestRoutePoint(currentPosition, routePoints);
  const DEVIATION_THRESHOLD_METERS = 100;
  const MAX_DEVIATION_METERS = 500;

  const shouldRecalculate = distance > MAX_DEVIATION_METERS;
  const shouldWarn = distance > DEVIATION_THRESHOLD_METERS;

  if (shouldRecalculate || shouldWarn) {
    onDeviationDetected(distance, shouldRecalculate);
  }
};

export default {
  runTestScenario,
  runAllTests,
  getTestScenarios,
  simulatePositionUpdate,
  calculateDistance,
  findClosestRoutePoint
}; 