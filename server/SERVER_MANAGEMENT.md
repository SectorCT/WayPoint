# WayPoint Backend Server Management

This document provides instructions for managing the WayPoint backend server using the included management script.

## 🚀 Quick Start

The server management script (`server_manager.sh`) provides easy commands to control your WayPoint backend server.

### Basic Commands

```bash
# Start the server
./server_manager.sh start

# Check server status
./server_manager.sh status

# Stop the server
./server_manager.sh stop

# Restart the server
./server_manager.sh restart
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `start` | Start the WayPoint backend server |
| `stop` | Stop the running server |
| `restart` | Restart the server |
| `status` | Show server status and information |
| `logs` | Show server logs |
| `test` | Test API endpoints |
| `migrate` | Run database migrations |
| `superuser` | Create Django superuser |
| `help` | Show help message |

## 🌐 Server Access

Once the server is running, it will be accessible at:

- **Local Access**: `http://localhost:8000`
- **Network Access**: `http://192.168.0.159:8000`
- **External Access**: `http://[YOUR_EXTERNAL_IP]:8000` (after port forwarding)

### API Endpoints

- **Authentication**: `http://localhost:8000/auth/`
- **Delivery**: `http://localhost:8000/delivery/`
- **Admin Panel**: `http://localhost:8000/admin/`

## 🔧 Server Configuration

The server runs with the following configuration:

- **Host**: `0.0.0.0` (accessible from all network interfaces)
- **Port**: `8000`
- **Database**: `waypoint_db` (PostgreSQL)
- **Environment**: Development mode with DEBUG=True

## 📱 Mobile App Integration

The mobile app is configured to connect to the server at:
- **Emulator**: `http://10.0.2.2:8000`
- **Physical Device**: `http://192.168.0.159:8000`

## 🔌 Port Forwarding

To access the server from external networks, configure port forwarding on your router:

1. **Port 8000** → Forward to `192.168.0.159:8000`
2. **Port 5432** → Forward to `192.168.0.159:5432` (optional, for direct DB access)

## 🛠️ Troubleshooting

### Server Won't Start
```bash
# Check if port 8000 is already in use
sudo netstat -tlnp | grep :8000

# Kill any processes using port 8000
sudo fuser -k 8000/tcp
```

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Permission Issues
```bash
# Make sure the script is executable
chmod +x server_manager.sh

# Check file permissions
ls -la server_manager.sh
```

## 📊 Monitoring

### Check Server Status
```bash
./server_manager.sh status
```

### View Server Logs
```bash
./server_manager.sh logs
```

### Test API Endpoints
```bash
./server_manager.sh test
```

## 🔄 Database Management

### Run Migrations
```bash
./server_manager.sh migrate
```

### Create Admin User
```bash
./server_manager.sh superuser
```

## 🚨 Production Deployment

For production deployment, consider:

1. **Change DEBUG to False** in `.env`
2. **Use a production WSGI server** (Gunicorn)
3. **Set up proper SSL certificates**
4. **Configure firewall rules**
5. **Set up monitoring and logging**

## 📞 Support

If you encounter issues:

1. Check the server status: `./server_manager.sh status`
2. Test API endpoints: `./server_manager.sh test`
3. Check server logs: `./server_manager.sh logs`
4. Verify database connectivity
5. Check network connectivity and port forwarding

---

**Server Management Script**: `./server_manager.sh`  
**Configuration File**: `.env`  
**Database**: PostgreSQL (`waypoint_db`)  
**Framework**: Django 5.2.6 with Django REST Framework
