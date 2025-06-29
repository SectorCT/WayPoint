# Route Deviation Detection System

## Overview

This system automatically detects when drivers deviate from their planned route and recalculates a new route to the remaining delivery points. The system includes both real-time monitoring and testing capabilities.

## Features

### 1. Real-time Deviation Detection
- **Monitoring Frequency**: Checks every 10 seconds
- **Minor Deviation Threshold**: 100 meters (shows warning)
- **Major Deviation Threshold**: 500 meters (triggers route recalculation)
- **Automatic Route Recalculation**: Creates new route from current position to remaining deliveries

### 2. Visual Indicators
- **Recalculation Indicator**: Shows "Recalculating Route..." when updating
- **Alert Messages**: Informs driver about deviations and route updates
- **Distance Logging**: Console logs show distance from route

### 3. Testing System
- **Test Scenarios**: 5 predefined scenarios to test different deviation levels
- **Simulation Tool**: Test without going outside
- **Visual Test Interface**: Easy-to-use test panel

## How to Test

### Method 1: Using the Test Interface (Recommended)

1. **Open the Trucker App**
   - Navigate to the trucker view
   - Look for the orange test button (🔬) in the bottom right

2. **Access Test Panel**
   - Tap the orange test button
   - The Route Deviation Tester will open

3. **Run Individual Tests**
   - Select any test scenario from the list
   - Tap the play button next to each scenario
   - Review the expected behavior and results

4. **Run All Tests**
   - Tap "Run All Tests" to see results for all scenarios at once

### Method 2: Manual Testing

1. **Start a Route**
   - Begin a delivery route in the app
   - Ensure you have an active route with multiple delivery points

2. **Simulate Deviation**
   - **Minor Deviation**: Move 100-500 meters away from the route
   - **Major Deviation**: Move more than 500 meters away from the route
   - **On Route**: Stay within 100 meters of the route

3. **Observe Behavior**
   - Check for alert messages
   - Watch for route recalculation indicator
   - Monitor console logs for distance measurements

### Method 3: Console Testing

1. **Open Developer Console**
   - Use React Native Debugger or browser console
   - Look for distance logs: `Distance from route: X.XX meters`

2. **Monitor System Behavior**
   - Check for recalculation logs: `Recalculating route due to deviation...`
   - Verify API calls to `/delivery/route/recalculate/`

## Test Scenarios

### 1. On Route
- **Position**: Close to route points
- **Expected**: No alerts, normal operation
- **Distance**: < 100m

### 2. Minor Deviation
- **Position**: Slightly off route
- **Expected**: Warning alert, no recalculation
- **Distance**: 100-500m

### 3. Major Deviation
- **Position**: Significantly off route
- **Expected**: Deviation alert + route recalculation
- **Distance**: > 500m

### 4. Edge Case - Just Below Threshold
- **Position**: 499m from route
- **Expected**: Warning only
- **Distance**: 499m

### 5. Edge Case - Just Above Threshold
- **Position**: 501m from route
- **Expected**: Full recalculation
- **Distance**: 501m

## Configuration

### Thresholds (Configurable in Code)

```typescript
const DEVIATION_THRESHOLD_METERS = 100; // Warning threshold
const MAX_DEVIATION_METERS = 500;       // Recalculation threshold
const CHECK_INTERVAL_MS = 10000;        // Check every 10 seconds
```

### Location (in `Client/app/(trucker)/index.tsx`)

```typescript
// Lines 67-70
const DEVIATION_THRESHOLD_METERS = 100;
const CHECK_INTERVAL_MS = 10000;
const MAX_DEVIATION_METERS = 500;
```

## API Endpoints

### New Endpoint: Route Recalculation
- **URL**: `POST /delivery/route/recalculate/`
- **Purpose**: Recalculates route from current position
- **Parameters**:
  - `username`: Driver username
  - `currentLat`: Current latitude
  - `currentLng`: Current longitude
- **Response**: New route coordinates and remaining packages count

### Server Location
- **File**: `server/delivery/routing.py`
- **Class**: `recalculateRoute`
- **URL Pattern**: `server/delivery/urls.py`

## Troubleshooting

### Common Issues

1. **No Deviation Detection**
   - Check if GPS is enabled
   - Verify route points are loaded
   - Check console for position updates

2. **False Positives**
   - Adjust thresholds in the code
   - Check GPS accuracy settings
   - Verify route point accuracy

3. **Recalculation Not Working**
   - Check server logs for API errors
   - Verify OSRM service is available
   - Check network connectivity

### Debug Information

The system logs the following information to the console:
- Distance from route: `Distance from route: X.XX meters`
- Recalculation events: `Recalculating route due to deviation...`
- API responses: Success/failure messages

## Performance Considerations

- **Battery Usage**: 10-second intervals may impact battery life
- **Network Usage**: Route recalculation requires API calls
- **GPS Accuracy**: System depends on accurate GPS positioning

## Future Enhancements

1. **Adaptive Thresholds**: Adjust thresholds based on road type
2. **Predictive Deviation**: Anticipate deviations before they occur
3. **Offline Mode**: Cache routes for offline recalculation
4. **Custom Alerts**: Allow drivers to customize alert preferences

## Support

For issues or questions about the route deviation system:
1. Check the console logs for error messages
2. Verify GPS and network connectivity
3. Test with the provided test scenarios
 