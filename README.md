# News Aggregator

A full-stack news aggregation application that uses Kafka Connect to fetch RSS feeds and provides a React-based web interface for reading and managing articles.

## Overview

This project consists of:
- **Frontend**: React application with user authentication, article management, and statistics
- **Backend**: Node.js/Express API with MongoDB integration
- **Data Pipeline**: Kafka Connect with RSS source connector and MongoDB sink connector
- **Database**: MongoDB for storing articles and user data

The application allows users to subscribe to RSS feeds, read articles, mark them as read/unread, star favorites, and view reading statistics.

## Key Features

- **RSS Feed Management**: Add, remove, and manage RSS feed subscriptions
- **Article Reading**: Browse articles by category, read status, or starred items
- **User Authentication**: Register, login, and user session management
- **Reading Statistics**: Track reading habits and view analytics
- **Real-time Updates**: Kafka-based data pipeline for automatic article fetching

## Dependencies

### Backend (server/)
- **Express.js** - Web framework
- **MongoDB/Mongoose** - Database and ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **rss-parser** - RSS feed parsing
- **node-cron** - Scheduled tasks
- **Axios** - HTTP client for Kafka Connect API

### Frontend (client/)
- **React** - UI framework
- **React Router** - Client-side routing
- **Styled Components** - CSS-in-JS styling
- **Recharts** - Data visualization
- **React GA** - Analytics

### Infrastructure
- **Kafka Connect** - Data pipeline
- **MongoDB** - Document database
- **Docker** - Containerization

## Run and Build

### Prerequisites
- Node.js (v16+)
- MongoDB
- Docker and Docker Compose
- Kafka Connect with RSS connector

### Backend Setup
```bash
cd server
npm install
npm start
```

### Frontend Setup
```bash
cd client
npm install
npm start
```

### Environment Variables
Create `.env` files in both `server/` and `client/` directories:

**Server (.env)**
```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
KAFKA_URL=http://localhost:8083/connectors
API_URL=http://localhost:3000
```

**Client (.env)**
```
REACT_APP_API_URL=http://localhost:3000
```

## Usage / Parameter Tuning

### Kafka Connect Management

#### Get all connectors
```bash
curl -i http://localhost:8083/connectors
```

#### Get number of connectors 
```bash
curl -s http://localhost:8083/connectors | jq length
```

#### Create a new RSS Source Connector 
```bash
curl -X POST http://localhost:8083/connectors \
     -H "Content-Type: application/json" \
     -d '{
           "name": "RssSourceConnectorDemo",
           "config": {
             "connector.class": "org.kaliy.kafka.connect.rss.RssSourceConnector",
             "tasks.max": "2",
             "rss.urls": "https://medium.com/feed/@markmanson",
             "topic": "RSS"
           }
         }'
```

#### Create a new Mongo Sink Connector
```bash
curl -X PUT \
  http://localhost:8083/connectors/MongoSinkConnectorDemo/config \
  -H "Content-Type: application/json" \
  -d '{
    "connector.class": "com.mongodb.kafka.connect.MongoSinkConnector",
    "tasks.max": "2",
    "topics": "RSS",
    "connection.uri": "your_mongo_connection_uri",
    "database": "project",
    "collection": "articles",
    "max.batch.size": "10",
    "transforms": "AddSource",
    "transforms.AddSource.type": "org.apache.kafka.connect.transforms.InsertField$Value",
    "transforms.AddSource.static.field": "read",
    "transforms.AddSource.static.value": ""
  }'
```

### Configuration Parameters

#### RSS Source Connector Parameters
- `tasks.max`: Number of parallel tasks (default: 2)
- `rss.urls`: Comma-separated list of RSS feed URLs
- `topic`: Kafka topic name for publishing articles

#### MongoDB Sink Connector Parameters
- `tasks.max`: Number of parallel tasks (default: 2)
- `topics`: Kafka topics to consume from
- `connection.uri`: MongoDB connection string
- `database`: Target database name
- `collection`: Target collection name
- `max.batch.size`: Maximum number of documents per batch (default: 10)

### Troubleshooting

1. **Consumer Offset Issues**: If you delete the MongoDB collection, the connector won't rewrite existing data due to offset tracking. Use the offset reset commands above or restart the entire Docker Compose stack.

2. **Connector State**: Always check connector status before making changes to ensure it's in a healthy state.

3. **Batch Size Tuning**: Adjust `max.batch.size` based on your MongoDB performance and article volume requirements.
