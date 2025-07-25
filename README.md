# News Aggregator

## Overview

This project is a full-stack news aggregator platform that collects, processes, and displays articles from various RSS/Atom feeds. It leverages a modern React frontend, a Node.js/Express backend, and a robust Kafka-based data pipeline for ingesting and processing news feeds at scale. The system is designed for extensibility, real-time updates, and user-centric features such as article categorization, starring, and reading statistics.

## Key Features

- **Automated RSS/Atom Feed Ingestion:**  
  Uses Kafka Connect with a custom RSS Source Connector to continuously poll and ingest articles from multiple feeds.
- **Scalable Data Pipeline:**  
  Kafka, Zookeeper, and Schema Registry are orchestrated via Docker Compose for reliable, distributed message processing.
- **User Authentication & Management:**  
  Secure registration, login, and session management using JWT, bcrypt, and Express middleware.
- **Personalized News Dashboard:**  
  React frontend with routes for categories, starred articles, reading history, and statistics.
- **Article Management:**  
  Users can star, mark as read, and browse articles by category or status.
- **Statistics & Analytics:**  
  Visualize reading habits and feed statistics using Recharts.
- **Extensible Architecture:**  
  Easily add new feeds, connectors, or downstream consumers.

## Run and Build

### Prerequisites

- Node.js (v18+ recommended)
- Docker & Docker Compose
- (Optional) MongoDB instance if not using Docker

### 1. Start Kafka and Connectors

```sh
cd kafka
docker-compose up -d
```
This will start Zookeeper, Kafka broker, Schema Registry, Kafka Connect, ksqlDB, and Control Center.

### 2. Start the Backend

```sh
cd server
npm install
# Set environment variables in a .env file (see below)
npm start
```

### 3. Start the Frontend

```sh
cd client
npm install
npm start
```
The React app will run on [http://localhost:3000](http://localhost:3000) by default.

### 4. Configure RSS Connectors

Edit or use the sample properties in  
`kafka/connectors/kaliy-kafka-connect-rss-0.1.1/kaliy-kafka-connect-rss-0.1.1/etc/rss-source-connector-sample.properties`  
and deploy via Kafka Connect REST API or scripts.

## Dependencies

### Frontend (`client/package.json`)

- React, React Router, Styled Components
- Recharts (for statistics)
- react-dropdown, react-ga, web-vitals

### Backend (`server/package.json`)

- Express, Mongoose, dotenv, cors, helmet, morgan
- bcrypt, jsonwebtoken, cookie-parser
- puppeteer, rss-parser, node-cron

### Data Pipeline

- Kafka, Zookeeper, Schema Registry, Kafka Connect (Confluent images)
- Kafka Connect RSS Source Connector
- MongoDB (for persistent storage)

## Usage & Parameter Tuning

### Environment Variables

#### Backend (`server/.env`)

- `MONGO_URL` – MongoDB connection string
- `PORT` – (optional) Port for Express server

#### Frontend

- `REACT_APP_API_URL` – (optional) Override API base URL

### Kafka Connect RSS Source Connector

**Key parameters (see [doc/README.md](kafka/connectors/kaliy-kafka-connect-rss-0.1.1/kaliy-kafka-connect-rss-0.1.1/doc/README.md)):**

| Name            | Description                                                        | Type   | Default | Importance |
|-----------------|--------------------------------------------------------------------|--------|---------|------------|
| `rss.urls`      | Space-separated, percent-encoded RSS/Atom feed URLs                | string |         | high       |
| `topic`         | Kafka topic to write to                                            | string |         | high       |
| `sleep.seconds` | Polling interval in seconds                                        | int    | 60      | medium     |

**Example:**
```properties
rss.urls=https%3A%2F%2Fnews.ycombinator.com%2Frss https%3A%2F%2Fwww.reddit.com%2Fr%2Fnews%2F.rss
topic=rss_topic
sleep.seconds=120
```

**Tuning Tips:**
- Increase `sleep.seconds` to reduce polling frequency and load.
- Use multiple URLs for broader coverage; adjust `tasks.max` for parallelism.
- Monitor Kafka and MongoDB resource usage for scaling.

### Docker Compose

- Adjust resource limits and port mappings in `kafka/docker-compose.yml` as needed.
- Add or remove services (e.g., ksqlDB, Control Center) based on your use case.
