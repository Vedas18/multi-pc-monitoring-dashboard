# Multi-PC System Monitoring Dashboard - Frontend

This is the React frontend for the Multi-PC System Monitoring Dashboard, providing a real-time web interface to monitor system resources across multiple computers.

## Features

- **Real-time Dashboard** - Live monitoring of CPU, RAM, and Disk usage
- **Individual PC Cards** - Detailed view for each connected PC
- **Overview Charts** - System-wide averages and trends
- **Historical Data** - 24-hour usage trends with interactive charts
- **Auto-refresh** - Automatic data updates every 30 seconds
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Status Indicators** - Color-coded alerts (Green/Yellow/Red)
- **Multiple Chart Types** - Line, Bar, and Pie charts for data visualization

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on port 5000

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file (optional):
   ```bash
   # Create .env file if you need to customize API URL
   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
   ```

## Running the Application

### Development Mode
```bash
npm start
```

This will start the development server on `http://localhost:3000` with hot reloading.

### Production Build
```bash
npm run build
```

This creates an optimized production build in the `build` folder.

### Serve Production Build
```bash
# Install serve globally
npm install -g serve

# Serve the build folder
serve -s build -l 3000
```

## Project Structure

```
frontend/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/
│   │   ├── Dashboard.js        # Main dashboard component
│   │   ├── PCCard.js          # Individual PC card component
│   │   └── OverviewChart.js   # Overview charts component
│   ├── utils/
│   │   └── api.js             # API utilities and data helpers
│   ├── App.js                 # Main app component
│   ├── App.css                # App-specific styles
│   ├── index.js               # React entry point
│   └── index.css              # Global styles
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## Components

### Dashboard.js
Main dashboard component that:
- Fetches system data from the backend API
- Manages auto-refresh functionality
- Handles error states and loading states
- Renders the overview chart and PC cards grid

### PCCard.js
Individual PC monitoring card that displays:
- Current CPU, RAM, and Disk usage with progress bars
- Status indicators (Good/Warning/Critical)
- 24-hour usage trend charts
- System information (OS, uptime)
- Manual refresh capability

### OverviewChart.js
System overview component featuring:
- Average usage across all PCs
- Multiple chart types (Line, Bar, Pie)
- 24-hour historical trends
- Interactive chart controls

## API Integration

The frontend communicates with the backend through the `api.js` utility:

### Available API Functions
- `systemDataAPI.getData()` - Fetch latest and historical data
- `systemDataAPI.getPCs()` - Get list of all PCs
- `systemDataAPI.getHealth()` - Check API health status
- `systemDataAPI.cleanupData()` - Clean up old data

### Data Processing Utilities
- `dataUtils.formatUptime()` - Format uptime in human-readable format
- `dataUtils.getStatusColor()` - Get color based on usage percentage
- `dataUtils.formatPercentage()` - Format percentage values
- `dataUtils.calculateAverage()` - Calculate averages from arrays

## Styling

The application uses a custom CSS implementation that mimics Tailwind CSS classes:

### Color Scheme
- **Background**: Dark theme (#0f172a, #1f2937, #374151)
- **Text**: Light colors (#ffffff, #e2e8f0, #9ca3af)
- **Status Colors**:
  - Green (#10b981): Good (< 60%)
  - Yellow (#f59e0b): Warning (60-80%)
  - Red (#ef4444): Critical (> 80%)

### Responsive Design
- Mobile-first approach
- Grid layouts that adapt to screen size
- Touch-friendly interface elements
- Optimized for various device sizes

## Configuration

### Environment Variables
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000/api)

### Auto-refresh Settings
- Default interval: 30 seconds
- Can be toggled on/off by user
- Manual refresh available

## Features in Detail

### Real-time Monitoring
- Live updates of system metrics
- Color-coded status indicators
- Progress bars for visual representation
- Historical trend visualization

### Data Visualization
- **Line Charts**: Show usage trends over time
- **Bar Charts**: Compare usage across time periods
- **Pie Charts**: Display current usage distribution
- **Progress Bars**: Real-time usage indicators

### User Experience
- Intuitive navigation
- Responsive design
- Loading states and error handling
- Accessibility features

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Optimized bundle size
- Lazy loading of components
- Efficient re-rendering
- Minimal API calls

## Development

### Adding New Features
1. Create new components in `src/components/`
2. Add API functions in `src/utils/api.js`
3. Update routing in `App.js` if needed
4. Add styles in `App.css` or component-specific CSS

### Code Style
- Use functional components with hooks
- Follow React best practices
- Include comprehensive comments
- Use consistent naming conventions

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Ensure backend server is running on port 5000
   - Check CORS settings in backend
   - Verify API URL in environment variables

2. **Charts Not Displaying**
   - Check browser console for errors
   - Ensure data is being received from API
   - Verify Recharts library is properly installed

3. **Styling Issues**
   - Clear browser cache
   - Check CSS class names
   - Verify responsive breakpoints

### Debug Mode
Enable debug logging by opening browser developer tools and checking the console for API request/response logs.

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The `build` folder contains static files that can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Any static file server

### Environment Configuration
For production deployment, set the `REACT_APP_API_URL` environment variable to point to your production backend API.

## License

MIT License - see main project README for details.
