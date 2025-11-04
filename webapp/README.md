# WayPoint Web Application

A logistics management dashboard for managers to oversee delivery operations including packages, trucks, drivers, journeys, and real-time route tracking.

## Features

- Manager authentication with session management
- Package creation and tracking
- Truck fleet management
- Driver account verification
- Journey planning and route optimization
- Interactive map visualization with MapLibre GL
- Real-time statistics and analytics with charts
- Office delivery tracking

## Technology Stack

- **React 18.3.1** with TypeScript
- **Vite** as build tool
- **React Router DOM 6.30.1** for routing
- **Tailwind CSS** with custom design system
- **shadcn/ui** component library
- **MapLibre GL** for maps
- **Recharts** for data visualization
- **Axios** for API calls

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_API_BASE=http://localhost:8000
VITE_GEOAPIFY_API_KEY=your_geoapify_api_key_here
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

### Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── ProtectedRoute.tsx
│   ├── SessionManager.tsx
│   └── QuickActions.tsx
├── lib/
│   ├── api.ts           # API client and endpoints
│   ├── auth.ts          # Auth utilities
│   └── utils.ts         # Helper functions
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Journeys.tsx
│   ├── Packages.tsx
│   ├── Trucks.tsx
│   ├── VerifyUsers.tsx
│   ├── Statistics.tsx
│   └── NotFound.tsx
├── App.tsx              # Main app with routing
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## Environment Variables

- `VITE_API_BASE`: Backend API base URL (defaults to `http://localhost:8000`)
- `VITE_GEOAPIFY_API_KEY`: Geoapify API key for reverse geocoding (optional)

## Authentication

The application uses JWT tokens stored in localStorage. Sessions expire after 30 minutes of inactivity.

## API Integration

All API calls are configured in `src/lib/api.ts`. The API client automatically:
- Adds authentication tokens to requests
- Handles 401 errors by logging out the user
- Uses the `VITE_API_BASE` environment variable for the base URL

## License

See LICENSE file for details.

