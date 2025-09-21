# Multi-PC System Monitoring Dashboard - Backend

This is the backend server for the Multi-PC System Monitoring Dashboard, built with Node.js, Express, and MongoDB.

## Features

- **RESTful API** for system data collection and retrieval
- **MongoDB** with Mongoose for data persistence
- **Real-time data** collection from multiple PCs
- **Historical data** storage (24 hours by default)
- **Overview statistics** with averages across all PCs
- **Automatic cleanup** of old data
- **Health monitoring** endpoints

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your MongoDB connection string
   MONGODB_URI=mongodb://localhost:27017/pc-monitoring
   PORT=5000
   NODE_ENV=development
   ```

## Running the Server

### Development Mode
```bash
npm run dev
```
This will start the server with nodemon for automatic restarts on file changes.

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` by default.

## API Endpoints

### System Data

- **POST** `/api/systemdata` - Submit system data from client
- **GET** `/api/systemdata` - Get latest and historical data
- **GET** `/api/systemdata/pcs` - Get list of all PCs
- **GET** `/api/systemdata/health` - Health check
- **DELETE** `/api/systemdata/cleanup` - Clean up old data

### General

- **GET** `/` - API information and available endpoints
- **GET** `/health` - Server health status

## Data Schema

The `SystemInfo` model stores the following data:

```javascript
{
  pcId: String,        // Unique PC identifier
  cpu: Number,         // CPU usage percentage (0-100)
  ram: Number,         // RAM usage percentage (0-100)
  disk: Number,        // Disk usage percentage (0-100)
  os: String,          // Operating system info
  uptime: Number,      // System uptime in seconds
  createdAt: Date      // Timestamp (auto-generated)
}
```

## Example API Usage

### Submit System Data
```bash
curl -X POST http://localhost:5000/api/systemdata \
  -H "Content-Type: application/json" \
  -d '{
    "pcId": "PC-001",
    "cpu": 45.2,
    "ram": 67.8,
    "disk": 23.1,
    "os": "Windows 10 Pro",
    "uptime": 86400
  }'
```

### Get Latest Data
```bash
curl http://localhost:5000/api/systemdata
```

### Get Data for Specific PC
```bash
curl "http://localhost:5000/api/systemdata?pcId=PC-001&hours=12"
```

## Database Management

### Automatic Cleanup
The API includes automatic cleanup functionality to remove old data:

```bash
# Clean up data older than 24 hours (default)
curl -X DELETE http://localhost:5000/api/systemdata/cleanup

# Clean up data older than 48 hours
curl -X DELETE "http://localhost:5000/api/systemdata/cleanup?hours=48"
```

### Manual Database Operations

You can also interact with MongoDB directly:

```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/pc-monitoring

# View all collections
show collections

# Query system data
db.systeminfos.find().sort({createdAt: -1}).limit(10)

# Count documents
db.systeminfos.countDocuments()
```

## Configuration

### Environment Variables

- `MONGODB_URI` - MongoDB connection string (default: mongodb://localhost:27017/pc-monitoring)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode (development/production)

### MongoDB Indexes

The following indexes are automatically created for optimal performance:

- `pcId` - For fast PC-specific queries
- `createdAt` - For time-based queries and cleanup
- `{pcId: 1, createdAt: -1}` - Compound index for latest data queries

## Monitoring and Logging

The server includes comprehensive logging:

- Request logging with timestamps
- MongoDB connection status
- Error logging with stack traces
- Graceful shutdown handling

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing process: `lsof -ti:5000 | xargs kill`

3. **Memory Issues**
   - Monitor with `/health` endpoint
   - Consider data cleanup for large datasets

### Health Check

Monitor server health:
```bash
curl http://localhost:5000/health
```

Response includes:
- Server status
- Uptime
- Memory usage
- MongoDB connection status

## Development

### Project Structure
```
backend/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── models/
│   └── SystemInfo.js      # MongoDB schema
├── routes/
│   └── systemData.js      # API routes
└── README.md              # This file
```

### Adding New Features

1. Create new routes in `routes/` directory
2. Add corresponding models in `models/` directory
3. Update server.js to include new routes
4. Test with appropriate API calls

## License

MIT License - see main project README for details.
