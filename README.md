# News Aggregator

A full-stack news aggregation application that uses Kafka Connect to fetch RSS feeds and provides a React-based web interface for reading and managing articles.

## Overview

This project consists of:
- **Frontend**: React application with user authentication, article management, and statistics
- **Backend**: Node.js/Express API with MongoDB integration
- **Data Pipeline**: Kafka Connect with RSS source connector and MongoDB sink connector
- **Database**: MongoDB for storing articles and user data

The application allows users to subscribe to RSS feeds, read articles, categorise them using Google NLP API, mark them as read/unread, star favorites, and view reading statistics.

For testing with a large number of feeds, use the provided bash script:

```bash
cd kafka
chmod +x create_rss_connectors.sh
./create_rss_connectors.sh
```

This script will create **150+ RSS connectors**, each polling a different feed every 60 seconds. This is useful for **Load testing** the application with high article volume.
Note: This is for testing purposes only.

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

### Kafka Server

```kafka
cd kafka
docker compose up -d

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

#### Google NLP Content Classification SMT

The project includes a custom Single Message Transform (SMT) that automatically categorizes articles using Google's Natural Language API. This SMT:

- **Analyzes article titles** using Google's `classifyText` API
- **Adds a `category` field** to articles that meet confidence thresholds
- **Supports configurable confidence thresholds** (default: 0.4)
- **Requires a Google Cloud API key** for authentication

**Configuration:**
```properties
transforms=AddCategory
transforms.AddCategory.type=com.example.googlenlpsmt.AddContentCategory
transforms.AddCategory.api.key=YOUR_GOOGLE_CLOUD_API_KEY
transforms.AddCategory.min.score=0.4
```

**Features:**
- **Automatic categorization** of articles into Google's predefined categories (ex: `/News`, `/Technology`, `/Business`)
- **Confidence-based filtering** to ensure only high-confidence classifications are applied
- **Schema evolution** - dynamically adds the `category` field to existing schemas
- **Error handling** - gracefully handles API failures without breaking the pipeline

**Setup:**
1. **Build the SMT**: `cd add-content-category && mvn clean package`
2. **Deploy the JAR**: Copy `target/add-content-category-1.0-SNAPSHOT.jar` to your Kafka Connect plugins directory
3. **Get Google Cloud API Key**: Enable the Natural Language API in Google Cloud Console
4. **Configure connectors** with the transform parameters above

