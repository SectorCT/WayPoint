# Route View Mode Feature

## Overview

The Route View Mode feature allows drivers to toggle between two different route display modes to reduce confusion and improve navigation efficiency.

## Features

### 1. Full Journey Mode
- **Icon**: 📊 Timeline
- **Description**: Shows the complete route with all delivery points
- **Use Case**: Overview of entire journey, planning, and understanding the full scope
- **Performance**: Shows all route points (may be more complex)

### 2. Next Goal Mode
- **Icon**: 🧭 Navigation
- **Description**: Shows only the route to the next delivery point
- **Use Case**: Focused navigation to immediate destination
- **Performance**: Optimized - only shows relevant route segment
- **Additional Info**: Shows recipient name in indicator bar

## How to Use

### Switching Between Modes

1. **Locate the Switch**: Look for the toggle switch at the bottom of the screen
2. **Toggle Modes**:
   - **Left Side (Full Journey)**: Tap to see complete route
   - **Right Side (Next Goal)**: Tap to see route to next delivery only

### Visual Indicators

- **Active Mode**: Highlighted with primary color
- **Inactive Mode**: Transparent background with border
- **Next Goal Indicator**: Shows recipient name when in "Next Goal" mode

## Technical Implementation

### Route Calculation

The system intelligently calculates the optimal route to the next delivery:

1. **Current Position**: Uses GPS location
2. **Next Delivery**: Finds closest undelivered package
3. **Route Segment**: Extracts relevant portion of full route
4. **Optimization**: Only shows necessary route points

### Performance Benefits

- **Reduced Rendering**: Fewer route points to display
- **Faster Updates**: Less data to process
- **Clearer Navigation**: Focused view reduces confusion
- **Battery Efficiency**: Less intensive map operations

## Code Structure

### Key Functions

```typescript
// Get next undelivered package
const getNextDeliveryPoint = (): RouteLocation | null

// Calculate route to next delivery
const getRouteToNextDelivery = (): Coordinate[]

// Route view mode state
const [showFullJourney, setShowFullJourney] = useState(true)
```

### UI Components

- **Switch Container**: `routeModeSwitch`
- **Switch Options**: `switchOption`, `switchOptionLeft`, `switchOptionRight`
- **Mode Indicator**: `routeModeIndicator`

## User Experience

### When to Use Each Mode

#### Full Journey Mode
- ✅ Starting the journey
- ✅ Planning and overview
- ✅ Understanding route structure
- ✅ When multiple deliveries are close together

#### Next Goal Mode
- ✅ Active navigation
- ✅ Focused delivery
- ✅ Complex urban areas
- ✅ When you want to avoid confusion

### Benefits

1. **Reduced Confusion**: Clear focus on immediate goal
2. **Better Performance**: Optimized route rendering
3. **Improved Navigation**: Simplified visual information
4. **Flexible Usage**: Easy switching between modes

## Testing

### Test Scenarios

1. **Mode Switching**: Verify smooth transitions between modes
2. **Route Accuracy**: Ensure next goal route is correct
3. **Performance**: Check that next goal mode loads faster
4. **Visual Feedback**: Confirm indicators work properly

### Manual Testing

1. Start a delivery route
2. Switch to "Next Goal" mode
3. Verify only relevant route segment is shown
4. Check that recipient name appears in indicator
5. Switch back to "Full Journey" mode
6. Confirm complete route is displayed

## Future Enhancements

1. **Auto-Switch**: Automatically switch to next goal when approaching delivery
2. **Custom Thresholds**: Allow users to set when to auto-switch
3. **Voice Guidance**: Integrate with voice navigation
4. **Route Preview**: Show upcoming turns in next goal mode
5. **ETA Display**: Show estimated time to next delivery

## Troubleshooting

### Common Issues

1. **Route Not Updating**: Check GPS signal and route data
2. **Switch Not Working**: Verify touch targets are accessible
3. **Performance Issues**: Ensure route calculation is optimized
4. **Visual Glitches**: Check theme colors and styling

### Debug Information

- Console logs show route mode changes
- Route point count is logged for performance monitoring
- Next delivery calculation is logged for debugging 