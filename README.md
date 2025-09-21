# Multi-PC System Monitoring Dashboard

A comprehensive MERN stack application for real-time monitoring of system resources across multiple computers. This dashboard provides a centralized view of CPU, RAM, and Disk usage with historical data visualization and alerting capabilities.

## 🚀 Features

### Real-time Monitoring
- **Live System Metrics** - CPU, RAM, and Disk usage monitoring
- **Multi-PC Support** - Monitor unlimited number of computers
- **Historical Data** - 24-hour usage trends and analytics
- **Auto-refresh** - Automatic data updates every 30 seconds

### Dashboard Features
- **Overview Charts** - System-wide averages and trends
- **Individual PC Cards** - Detailed monitoring for each computer
- **Status Alerts** - Color-coded indicators (Green/Yellow/Red)
- **Multiple Chart Types** - Line, Bar, and Pie charts
- **Responsive Design** - Works on desktop, tablet, and mobile

### Technical Features
- **RESTful API** - Clean and well-documented API endpoints
- **MongoDB Storage** - Efficient data storage with automatic cleanup
- **Error Handling** - Robust error handling and retry logic
- **Cross-platform** - Works on Windows, macOS, and Linux
- **Configurable** - Highly customizable settings

## 📁 Project Structure

```
multi-pc-monitoring-dashboard/
│
├── backend/                    # Node.js + Express + MongoDB
│   ├── server.js              # Express server entry point
│   ├── package.json           # Backend dependencies
│   ├── routes/
│   │   └── systemData.js      # API endpoints for client data
│   ├── models/
│   │   └── SystemInfo.js      # Mongoose schema for system data
│   └── README.md              # Backend setup instructions
│
├── frontend/                   # React dashboard
│   ├── package.json           # Frontend dependencies
│   ├── public/
│   │   └── index.html         # HTML template
│   ├── src/
│   │   ├── App.js             # Main app component
│   │   ├── index.js           # ReactDOM render
│   │   ├── components/
│   │   │   ├── Dashboard.js   # Main dashboard page
│   │   │   ├── PCCard.js      # Individual PC card component
│   │   │   └── OverviewChart.js # Overall average charts
│   │   └── utils/
│   │       └── api.js         # Axios API calls
│   └── README.md              # Frontend setup instructions
│
├── client-script/              # System monitoring client
│   ├── client.js              # Node.js script to send JSON data
│   ├── package.json           # Client dependencies
│   └── README.md              # Instructions for running client script
│
└── README.md                   # This file
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **Recharts** - Chart library
- **Axios** - HTTP client
- **CSS3** - Styling (custom Tailwind-like classes)

### Client Script
- **systeminformation** - System metrics collection
- **Axios** - HTTP client for data transmission
- **Node.js** - Runtime environment

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### 1. Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd multi-pc-monitoring-dashboard

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install client script dependencies
cd ../client-script
npm install
```

### 2. Start MongoDB
```bash
# Start MongoDB service
# Windows
net start MongoDB

# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 3. Start Backend Server
```bash
cd backend
npm start
# Server will start on http://localhost:5000
```

### 4. Start Frontend Dashboard
```bash
cd frontend
npm start
# Dashboard will open at http://localhost:3000
```

### 5. Run Client Script
```bash
cd client-script
npm start
# Client will start monitoring and sending data
```

## 📊 Usage

### Dashboard Interface
1. **Open Dashboard** - Navigate to `http://localhost:3000`
2. **View Overview** - See system-wide averages and trends
3. **Monitor Individual PCs** - Check detailed metrics for each computer
4. **Toggle Auto-refresh** - Enable/disable automatic updates
5. **Manual Refresh** - Force immediate data update

### Client Script Configuration
```bash
# Basic usage
node client.js

# Custom PC ID and server
PC_ID=MyPC-001 SERVER_URL=http://192.168.1.100:5000/api/systemdata node client.js

# Verbose logging
VERBOSE=true node client.js
```

### API Endpoints
- `POST /api/systemdata` - Submit system data
- `GET /api/systemdata` - Get latest and historical data
- `GET /api/systemdata/pcs` - Get list of all PCs
- `GET /api/systemdata/health` - Health check
- `DELETE /api/systemdata/cleanup` - Clean up old data

## ⚙️ Configuration

### Backend Configuration
Create `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/pc-monitoring
PORT=5000
NODE_ENV=development
```

### Frontend Configuration
Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Client Configuration
Create `client-script/.env`:
```env
SERVER_URL=http://localhost:5000/api/systemdata
PC_ID=MyPC-001
COLLECTION_INTERVAL=5000
VERBOSE=false
```

## 📈 Monitoring Multiple PCs

### Setup Multiple Clients
1. **Copy client script** to each PC you want to monitor
2. **Install dependencies** on each PC
3. **Configure unique PC_ID** for each client
4. **Start the client** on each PC

### Example Setup
```bash
# PC 1 (Office Desktop)
PC_ID=Office-Desktop-01 node client.js

# PC 2 (Office Laptop)
PC_ID=Office-Laptop-01 node client.js

# PC 3 (Home Server)
PC_ID=Home-Server-01 node client.js
```

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev  # Start with nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm start    # Start with hot reloading
```

### Client Development
```bash
cd client-script
npm run dev  # Start with nodemon for auto-restart
```

## 📊 Data Schema

### SystemInfo Model
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

## 🚨 Status Indicators

### Usage Thresholds
- **Green (< 60%)** - Good performance
- **Yellow (60-80%)** - Warning level
- **Red (> 80%)** - Critical level

### Alert System
- Color-coded progress bars
- Status badges on each metric
- Historical trend visualization
- Real-time updates

## 🔒 Security Considerations

### Network Security
- Use HTTPS in production
- Implement proper firewall rules
- Consider VPN for remote monitoring

### Data Privacy
- No personal data collection
- System metrics only
- Configurable data retention

### Access Control
- Single-user dashboard (no authentication)
- API endpoint protection
- CORS configuration

## 🚀 Deployment

### Production Backend
```bash
cd backend
npm run build
NODE_ENV=production npm start
```

### Production Frontend
```bash
cd frontend
npm run build
# Deploy build/ folder to static hosting
```

### Client as Service
```bash
# Using PM2
npm install -g pm2
pm2 start client.js --name "pc-monitoring"
pm2 save
pm2 startup
```

## 📝 API Documentation

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

### Get PC List
```bash
curl http://localhost:5000/api/systemdata/pcs
```

## 🐛 Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Ensure MongoDB is running
   - Check connection string
   - Verify port availability

2. **Frontend Not Loading Data**
   - Check backend server status
   - Verify API URL configuration
   - Check browser console for errors

3. **Client Not Sending Data**
   - Verify server URL
   - Check network connectivity
   - Enable verbose logging

4. **Charts Not Displaying**
   - Check data availability
   - Verify Recharts installation
   - Check browser compatibility

### Debug Mode
```bash
# Backend debug
NODE_ENV=development npm start

# Frontend debug
REACT_APP_DEBUG=true npm start

# Client debug
VERBOSE=true node client.js
```

## 📊 Performance

### System Requirements
- **Backend**: 512MB RAM, 1 CPU core
- **Frontend**: Modern web browser
- **Client**: 50MB RAM, minimal CPU usage
- **Database**: 100MB storage per 1000 data points

### Optimization
- Data retention: 24 hours by default
- Automatic cleanup of old data
- Efficient database queries with indexes
- Optimized React rendering

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [systeminformation](https://github.com/sebhildebrandt/systeminformation) - System metrics collection
- [Recharts](https://recharts.org/) - Chart library
- [Express.js](https://expressjs.com/) - Web framework
- [React](https://reactjs.org/) - UI library
- [MongoDB](https://www.mongodb.com/) - Database

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the individual README files in each component

---

**Multi-PC System Monitoring Dashboard** - Real-time monitoring made simple! 🖥️📊
