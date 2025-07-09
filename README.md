# Get all connectors
curl -i http://localhost:8083/connectors
# Get number of connectors 
curl -s http://localhost:8083/connectors | jq length
# Create a new RSS Source Connector 
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

# Create a new Mongo Sink Connector           
curl -X POST http://localhost:8083/connectors   -H "Content-Type: application/json"   -d '{
        "name": "MongoSinkConnectorDemo",
        "config": {
          "connector.class": "com.mongodb.kafka.connect.MongoSinkConnector",
          "tasks.max": "2",
          "topics": "RSS",
          "connection.uri": "your_connection_uri",
          "database": "project",
          "collection": "articles",
          "max.batch.size": "10"
        }
      }'

OR use this if you want to use additional fields in your mongo schema

curl -X PUT \
  http://localhost:8083/connectors/MongoSinkConnectorDemo/config \
  -H "Content-Type: application/json" \
  -d '{
    "connector.class": "com.mongodb.kafka.connect.MongoSinkConnector",
    "tasks.max": "2",
    "topics": "RSS",
    "connection.uri": "mongodb+srv://flaviamdumitrica:Abc123456789@cluster0.5zbu4sa.mongodb.net/project",
    "database": "project",
    "collection": "articles",
    "max.batch.size": "10",
    "transforms": "AddSource",
    "transforms.AddSource.type": "org.apache.kafka.connect.transforms.InsertField$Value",
    "transforms.AddSource.static.field": "read",
    "transforms.AddSource.static.value": ""
  }'

         
# Inspect Kafka topic through kafkacat
docker exec kafkacat kafkacat     -b broker:29092     -t RSS     -C -o beginning

There is a consumer offset issue- there is an offset pointer for each topic - if you delete the DB collection it won't rewrite what it's already written - you need to delete and docker compose the containers - there could be a workaround with the CONSUMER_OFFSET flag in docker compose file

# Stop it first
curl -X PUT  http://localhost:8083/connectors/rss1/stop
# Reset its offsets (Confluent 7.3 / Apache Kafka 3.3+)
curl -X DELETE http://localhost:8083/connectors/rss1/offsets
# Optionally delete the connector if you prefer
curl -X DELETE http://localhost:8083/connectors/rss1

# JSON with version, commit, etc.
curl http://localhost:8083/     

# State of the connector
curl -s http://localhost:8083/connectors/rss_nyt/status | jq '.connector.state'

