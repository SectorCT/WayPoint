# WayPoint Website Implementation Documentation

## Overview
This is a logistics management web application for managing delivery operations. The website serves as a manager dashboard for overseeing packages, trucks, drivers, journeys, and delivery statistics.

## Color Palette

The following color palette should be used for the website design. The designer should determine appropriate usage of these colors for different UI elements, states, and interactions.

### Primary Colors
- **Medium Primary**: `#F39358` - Orange/coral
- **Dark Primary**: `#F05033` - Red-orange
- **Light Primary**: `#F8D5B0` - Light peach/beige

### Neutral Colors
- **Light Grey**: `#B2B2B2` - Medium grey
- **White**: `#FFFFFF`
- **Black**: `#000000`
- **Background Grey**: `#f5f6fa` - Light grey background
- **Text Grey Shades**: `#333`, `#666`, `#888` - Various shades for secondary text
- **Border Grey Shades**: `#e0e0e0`, `#eee` - Light grey for borders and dividers

### Status Colors
- **Success Green**: `#4CAF50` - For success states and positive indicators
- **Success Light Green**: `#E8F5E9` - Light green background for success states
- **Error Red**: `#FF4136` - For error messages and negative indicators
- **Error Light Red**: `#FFEBEE` - Light red background for error states
- **Active Blue**: `#1976d2` - For active states
- **Available Orange**: `#ff7e5f` - For available states
- **Info Blue**: `#2196F3` - For informational elements
- **Warning Orange**: `#FF9800` - For warning states
- **Accent Purple**: `#9C27B0` - For accent elements

### Gradient Combinations
- **Primary Gradient**: `linear-gradient(90deg, #F39358 0%, #F05033 100%)`
- **Reverse Gradient**: `linear-gradient(135deg, #F05033 0%, #F39358 100%)`
- **Selected Route Gradient**: `linear-gradient(135deg, #FF4136 0%, #DC143C 100%)`

Note: The designer should determine appropriate usage of these colors for buttons, backgrounds, text, borders, status indicators, charts, and other UI elements based on design best practices and user experience considerations.

## Architecture

### Technology Stack
- **Framework**: React 18 with TypeScript
- **Routing**: React Router DOM v6
- **Mapping**: MapLibre GL (via @vis.gl/react-maplibre)
- **Charts**: Recharts
- **Build Tool**: Create React App
- **State Management**: React Hooks (useState, useEffect)
- **Storage**: LocalStorage for authentication tokens and user data

### API Configuration
- Base API URL: Configurable via `REACT_APP_API_BASE` environment variable (defaults to `http://localhost:8000`)
- API Version: `v1`
- Authentication: Bearer token authentication
- Additional Service: Geoapify API for reverse geocoding (API key via `REACT_APP_GEOAPIFY_API_KEY`)

## Authentication & Authorization

### Authentication Flow
1. User submits email and password on login page
2. Backend validates credentials and returns access token, refresh token, and user data
3. Tokens and user data stored in localStorage
4. Login timestamp stored for session management
5. User redirected to dashboard if authentication successful

### Session Management
- Session timeout: 30 minutes
- Session validation: Checks every minute
- Session expiration handling: 
  - Removes user data and tokens from localStorage
  - Shows modal overlay blocking interaction
  - Redirects to login page

### Access Control
- Only users with `isManager: true` can access the application
- Protected routes check for:
  - Valid user in localStorage
  - User has manager role
  - Valid session (not expired)
- Unauthorized access redirects to login page

## Application Structure

### Routes
1. `/login` - Authentication page
2. `/dashboard` - Main dashboard with overview and analytics
3. `/journeys` - Journey management and route visualization
4. `/packages` - Package management and creation
5. `/trucks` - Truck management
6. `/verifyusers` - User verification interface
7. `/statistics` - Detailed statistics and analytics
8. `/` - Redirects to `/dashboard`

### Navigation Pattern
- Quick action buttons available on all pages (except login)
- Back to Dashboard button on all feature pages
- Navigation between pages via React Router

## Core Features

### 1. Login Page

#### Functionality
- Email and password input fields
- Form validation (required fields)
- Loading state during authentication
- Error message display for failed login attempts
- Access restriction message for non-manager users
- Automatic redirect to dashboard on successful login

#### User Flow
1. User enters credentials
2. System validates credentials
3. On success: stores tokens, redirects to dashboard
4. On failure: displays error message
5. On non-manager: displays access denied message

### 2. Dashboard Page

#### Overview Section
- Welcome message with manager name
- Summary cards showing:
  - Active Journeys count
  - Packages scheduled for today
  - Available trucks count
  - Pending user verifications count
- Each summary card is clickable and navigates to relevant page

#### Analytics Section
- Rotating analytics display (auto-advances every 7.5 seconds)
- Three chart types:
  1. **Line Chart**: Packages delivered over last 7 days
  2. **Bar Chart**: Truck usage statistics
  3. **Pie Chart**: Package status distribution
- Charts can be clicked to navigate to full statistics page
- Manual navigation controls (previous/next) for analytics
- Slide animation between chart views

#### Data Fetching
- Fetches on page load:
  - All packages
  - Available trucks
  - Delivery history (last 7 days)
  - Unverified truckers
  - Statistics data
- Displays loading state during data fetch
- Error handling with user-friendly messages

#### Additional Features
- Logout functionality
- Quick action navigation buttons

### 3. Journeys Page

#### Main Purpose
Manage active delivery routes and start new journeys

#### Layout Structure
- Three-column layout:
  1. Left: Driver selection and journey controls
  2. Center: Interactive map with routes
  3. Right: Office deliveries panel

#### Driver Selection Panel
- List of all available drivers
- Search functionality (by username or email)
- Driver cards showing:
  - Username
  - Email
  - Active route status indicator
- Selection mechanism:
  - Toggle selection with click
  - Selected drivers visually indicated
  - Drivers with active routes cannot be selected
- "Start Journey" button (enabled when drivers selected)

#### Journey Start Process
1. Select one or more drivers
2. Click "Start Journey"
3. System opens truck assignment modal
4. Assign trucks to each selected driver
5. Confirm assignments
6. System:
   - Plans routes for selected drivers
   - Assigns trucks
   - Starts journeys
   - Updates active routes

#### Map Visualization
- Interactive map using MapLibre GL
- Displays active routes as polylines
- Each route has unique color (determined by driver username hash)
- Package markers on map:
  - Numbered markers for packages
  - Special marker for warehouse (ADMIN package)
  - Status indicators:
    - Delivered packages: checkmark
    - Undelivered packages: X mark
    - Pending packages: package number
- Route selection:
  - Click route card to select
  - Selected route highlighted on map
  - Map auto-focuses on selected route bounds

#### Active Routes Bar
- Horizontal scrollable list of active routes
- Each route card shows:
  - Driver username
  - Total packages count
  - Delivered packages count
  - Undelivered packages count
  - Active indicator dot
- Route color matches map polyline color
- Clicking route card selects it and focuses map

#### Office Deliveries Panel
- Shows undelivered packages grouped by office
- Summary statistics:
  - Total offices count
  - Total packages count
  - Total weight
- Expandable office cards:
  - Office name and address
  - Package count badge
  - Expand to see package details
- Package details include:
  - Package ID
  - Recipient name
  - Recipient phone
  - Address
  - Weight
  - Driver who left package

#### Top Bar Information
- Available trucks counter
- Today's packages counter
- Active routes bar (centered)

#### Truck Assignment Modal
- Two-column layout:
  - Left: Selected drivers with assignment status
  - Right: Available trucks list
- Driver assignment tracking:
  - Shows which driver has truck assigned
  - Visual confirmation when truck assigned
- Truck assignment:
  - Click truck to assign to next unassigned driver
  - Shows truck license plate and capacity
  - Removes assigned truck from available list
- Confirmation:
  - Shows count of assigned vs total drivers
  - "Start Journey" button (enabled when all drivers have trucks)
  - Progress indicator during journey start process

#### Loading States
- Journey start process shows:
  - Loading message
  - Progress indicator
  - Step-by-step status updates

#### Error Handling
- Error modal for journey start failures
- Validation for unassigned drivers
- Conflict detection (driver/truck/package already assigned)

### 4. Packages Page

#### Layout Structure
- Two-column layout:
  1. Left: Package creation form
  2. Right: Package list with map previews

#### Package Creation Form
- Required fields:
  - Delivery Address (text input or map picker)
  - Recipient Name
  - Recipient Phone Number
  - Delivery Date (date picker)
  - Weight in kilograms (number input)
- Map picker integration:
  - Button to open map modal
  - Click on map to select location
  - Reverse geocoding to populate address field
  - Coordinate validation (latitude/longitude)
- Form validation:
  - All fields required
  - Weight must be positive number
  - Date must be valid format
- Submission:
  - Creates package via API
  - Refreshes package list on success
  - Clears form on success
  - Displays error message on failure

#### Package List
- Grouped by delivery date:
  - "Today" group (if applicable)
  - Date groups sorted chronologically (newest first)
  - "Unknown" group for packages without dates
- Each package shows:
  - Package ID
  - Delivery address
  - Status (delivered, pending, in transit, undelivered)
- Status indicators:
  - Different visual treatment per status
- Map preview:
  - "Show on Map" button for packages with coordinates
  - Opens popup with map centered on package location
  - Map shows marker at package location
  - Popup can be closed by clicking outside or X button

#### Data Management
- Fetches all packages on page load
- Refreshes list after package creation
- Loading state during data fetch
- Error handling with user-friendly messages

### 5. Trucks Page

#### Layout Structure
- Two-column layout:
  1. Left: Truck creation form
  2. Right: Truck list

#### Truck Creation Form
- Required fields:
  - License Plate (text input)
  - Max Capacity in kilograms (number input)
- Form validation:
  - Both fields required
  - Capacity must be positive number
- Submission:
  - Creates truck via API
  - Refreshes truck list on success
  - Clears form on success
  - Displays error message on failure

#### Truck List
- Shows all available trucks
- Each truck displays:
  - License Plate
  - Capacity in kilograms
  - Usage status (Available or In Use)
- Status indicators:
  - Different visual treatment for available vs in use

#### Data Management
- Fetches available trucks on page load
- Refreshes list after truck creation
- Loading state during data fetch
- Error handling with user-friendly messages

### 6. Verify Users Page

#### Purpose
Review and approve unverified trucker accounts

#### Functionality
- Fetches all unverified users on page load
- Filters to show only non-manager users with `verified: false`
- Displays user list with:
  - Username
  - Email address
- Verification action:
  - "Accept" button for each user
  - Loading state during verification
  - Removes user from list on successful verification
- Empty state:
  - Message when no users to verify

#### Data Management
- Fetches all drivers
- Filters to unverified non-managers
- Updates list after verification
- Loading and error states

### 7. Statistics Page

#### Purpose
Comprehensive analytics and statistics dashboard

#### Summary Statistics Cards
Six metric cards displaying:
1. Total Packages
2. Delivered Packages
3. Total Trucks
4. Active Routes
5. Total Drivers
6. Pending Verification Count

#### Chart Visualizations
Three chart types in grid layout:

1. **Line Chart**: Packages Delivered (Last 7 Days)
   - X-axis: Days of week
   - Y-axis: Number of packages
   - Data from `daily_deliveries` API response

2. **Bar Chart**: Truck Usage
   - X-axis: Truck identifier
   - Y-axis: Usage count
   - Data from `truck_usage_data` API response

3. **Pie Chart**: Package Status Distribution
   - Segments: Delivered, In Transit, Pending, Undelivered
   - Data from `package_status_distribution` API response

#### Data Fetching
- Fetches statistics from `/delivery/statistics/` endpoint
- Displays loading state during fetch
- Error handling with retry option
- Responsive grid layout (adjusts columns based on screen size)

#### Additional Features
- Responsive design for different screen sizes
- Grid layout adjusts: 3 columns → 2 columns → 1 column

## API Integration

### Authentication Endpoints
- `POST /v1/auth/login/` - User login

### Package Endpoints
- `GET /v1/delivery/packages/` - Get all packages
- `GET /v1/delivery/packages/today-pending/` - Get today's pending packages
- `POST /v1/delivery/packages/create/` - Create new package

### Truck Endpoints
- `GET /v1/delivery/trucks/available/` - Get available trucks
- `GET /v1/delivery/trucks/` - Get all trucks
- `POST /v1/delivery/trucks/create/` - Create new truck

### Journey/Route Endpoints
- `GET /v1/delivery/route/all/` - Get all active routes
- `POST /v1/delivery/route/` - Plan routes for drivers
- `POST /v1/delivery/route/assign/` - Assign truck and start journey
- `POST /v1/delivery/route/checkDriverStatus/` - Check driver status

### User Management Endpoints
- `GET /v1/auth/all/` - Get all users
- `POST /v1/delivery/truckers/verify/` - Verify trucker account

### Statistics Endpoints
- `GET /v1/delivery/statistics/` - Get comprehensive statistics

### Office Delivery Endpoints
- `GET /v1/delivery/offices/undelivered_route/{driverUsername}/` - Get undelivered packages by route

### Delivery History Endpoints
- `GET /v1/delivery/history/?days={days}` - Get delivery history

### Unverified Truckers Endpoints
- `GET /v1/delivery/truckers/unverified/` - Get unverified truckers

## Data Structures

### Package Object
- `packageID`: string
- `recipient`: string
- `recipientPhoneNumber`: string
- `weight`: number
- `deliveryDate`: string (ISO date format)
- `address`: string
- `latitude`: number
- `longitude`: number
- `status`: string (pending, in_transit, delivered, undelivered)

### Truck Object
- `licensePlate`: string
- `kilogramCapacity`: number
- `isUsed`: boolean

### Route Object
- `routeID`: string
- `user`: string (driver username)
- `status`: string (active, completed, etc.)
- `packageSequence`: array of package objects with coordinates
- `mapRoute`: array of [longitude, latitude] coordinates
- `numTrucks`: number
- `deliveredTrucks`: number

### Driver Object
- `username`: string
- `email`: string
- `firstName`: string
- `lastName`: string
- `phoneNumber`: string
- `verified`: boolean
- `isManager`: boolean

### Statistics Object
- `package_stats`: { total, pending, in_transit, delivered, undelivered }
- `truck_stats`: { total, used, available }
- `truck_usage_data`: array of { truck, used, capacity, isUsed }
- `daily_deliveries`: array of { day, value, date }
- `package_status_distribution`: array of { name, value }
- `summary_stats`: { active_routes, total_drivers, verified_drivers, unverified_drivers }
- `recent_activity`: array of { text, type, time }

### Office Delivery Object
- `office`: { id, name, address, latitude, longitude }
- `packages`: array of package objects with driver information

## User Interactions

### Form Interactions
- Text input fields with validation
- Date picker for date selection
- Number input with min/max constraints
- Submit buttons with loading states
- Error message display below forms

### Map Interactions
- Click to select location (map picker)
- Click route card to select route (journeys page)
- Map auto-focuses on selected route
- Marker display for packages
- Route polyline visualization

### Modal Interactions
- Click outside to close (map picker, truck assignment)
- Close button (X) in modals
- Confirmation buttons for actions
- Loading states during async operations

### List Interactions
- Expandable items (office deliveries)
- Search/filter functionality (drivers, packages)
- Click to navigate (summary cards)
- Status indicators (visual feedback)

## State Management

### Local Storage
- `access`: JWT access token
- `refresh`: JWT refresh token
- `user`: JSON stringified user object
- `loginTime`: Timestamp of login (for session timeout)

### Component State
- Loading states for async operations
- Error states for failed operations
- Form input values
- Selected items (drivers, routes)
- Expanded/collapsed states
- Modal open/close states

## Error Handling

### Authentication Errors
- Invalid credentials: Error message displayed
- Non-manager access: Access denied message
- Session expired: Modal overlay with login redirect

### API Errors
- Network errors: Error message displayed
- Validation errors: Field-specific error messages
- Server errors: Generic error message with retry option

### Form Validation
- Required fields: Prevents submission
- Invalid formats: Error message displayed
- Missing data: Error message displayed

## Loading States

### Page-Level Loading
- Full page loading indicator during initial data fetch
- Skeleton or placeholder content

### Component-Level Loading
- Button loading states (disabled with loading text)
- Modal loading states (progress indicators)
- List loading states (loading message)

### Async Operation Loading
- Journey start: Multi-step progress indicator
- Package creation: Button loading state
- Statistics fetch: Loading message

## Data Refresh Patterns

### Automatic Refresh
- Statistics page: On mount
- Dashboard: On mount
- Journeys page: After journey start

### Manual Refresh
- Package list: After package creation
- Truck list: After truck creation
- User list: After user verification

## Responsive Behavior

### Layout Adjustments
- Statistics page: Grid columns adjust based on screen width
- Two-column layouts: Stack on smaller screens
- Navigation: Adapts to screen size

### Map Behavior
- Fixed aspect ratio on journeys page
- Responsive sizing in modals
- Touch-friendly interactions

## Accessibility Considerations

### Keyboard Navigation
- Form fields tabbable
- Buttons accessible via keyboard
- Modal focus management

### Screen Reader Support
- Semantic HTML elements
- ARIA labels where appropriate
- Error announcements

## Performance Considerations

### Data Fetching
- Parallel API calls where possible
- Caching in component state
- Minimal re-renders

### Map Rendering
- Efficient marker rendering
- Route polyline optimization
- Map viewport management

### Chart Rendering
- Responsive chart sizing
- Efficient data processing
- Animation performance

## Security Features

### Token Management
- Tokens stored in localStorage
- Token validation on each request
- Automatic logout on token expiry

### Input Validation
- Client-side validation
- Server-side validation (via API)
- XSS prevention (React automatic escaping)

### Route Protection
- Protected route components
- Role-based access control
- Session validation

## Integration Points

### External Services
- **Geoapify API**: Reverse geocoding for address lookup
- **MapLibre GL**: Map rendering and interaction
- **Backend API**: All data operations

### Internal Dependencies
- React Router for navigation
- Recharts for data visualization
- React Helmet for page titles

## Data Flow

### Authentication Flow
1. User submits login form
2. API validates credentials
3. Tokens stored in localStorage
4. User redirected to dashboard
5. Protected routes check tokens on mount

### Package Creation Flow
1. User fills form or selects map location
2. Reverse geocoding if map selected
3. Form submitted with all data
4. API creates package
5. Package list refreshed

### Journey Start Flow
1. User selects drivers
2. Opens truck assignment modal
3. Assigns trucks to drivers
4. Confirms assignments
5. API plans routes
6. API assigns trucks and starts journeys
7. Routes refreshed on map
8. Office deliveries updated

### Statistics Display Flow
1. Page loads
2. Fetches statistics from API
3. Processes data for charts
4. Renders summary cards
5. Renders charts with data

## Feature Dependencies

### Journey Page Dependencies
- Requires: Packages, Trucks, Drivers data
- Requires: Active routes data
- Requires: Map rendering library

### Statistics Page Dependencies
- Requires: Statistics API endpoint
- Requires: Chart library
- Requires: All other data sources

### Package Page Dependencies
- Requires: Geoapify API key (for reverse geocoding)
- Requires: Map rendering library

## User Workflows

### Starting a New Journey
1. Navigate to Journeys page
2. Search/select available drivers
3. Click "Start Journey"
4. Assign trucks to drivers in modal
5. Confirm assignments
6. System plans routes and starts journeys
7. Routes appear on map

### Adding a Package
1. Navigate to Packages page
2. Fill package form or use map picker
3. Submit form
4. Package added and list refreshed

### Verifying a User
1. Navigate to Verify Users page
2. Review unverified users
3. Click "Accept" for user
4. User verified and removed from list

### Viewing Statistics
1. Navigate to Statistics page
2. View summary cards
3. Review chart visualizations
4. Navigate to detailed views if needed

## Technical Constraints

### Browser Requirements
- Modern browser with ES6+ support
- LocalStorage support required
- Canvas support for maps and charts

### API Requirements
- CORS enabled for API calls
- Bearer token authentication
- Consistent JSON response format

### Environment Variables
- `REACT_APP_API_BASE`: Backend API URL
- `REACT_APP_GEOAPIFY_API_KEY`: Geoapify API key

## Data Validation

### Client-Side Validation
- Required field checks
- Format validation (email, date, number)
- Range validation (weight, capacity)

### Server-Side Validation
- API endpoints validate all inputs
- Error responses contain validation messages
- Client displays API validation errors

## Future Enhancement Considerations

### Potential Features (Not Currently Implemented)
- Real-time route updates
- Push notifications
- Advanced filtering and search
- Export functionality
- Multi-language support
- Dark mode toggle
- Print functionality
- Mobile app integration

### Technical Improvements
- Token refresh mechanism
- Offline support
- Progressive Web App features
- Advanced caching strategies
- Performance optimizations

