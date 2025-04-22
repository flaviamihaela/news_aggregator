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
          "connection.uri": "mongodb+srv://username:password@clustername.clusternumber.mongodb.net/project",
          "database": "project",
          "collection": "articles",
          "max.batch.size": "10"
        }
      }'
         
# Inspect Kafka topic through kafkacat
docker exec kafkacat kafkacat     -b broker:29092     -t RSS     -C -o beginning

# Stop it first
curl -X PUT  http://localhost:8083/connectors/rss1/stop
# Reset its offsets (Confluent 7.3 / Apache Kafka 3.3+)
curl -X DELETE http://localhost:8083/connectors/rss1/offsets
# Optionally delete the connector if you prefer
curl -X DELETE http://localhost:8083/connectors/rss1

# Idempotency for MongoDB
.....
document.id.strategy = com.mongodb.kafka.connect.sink.processor.id.strategy.PartialValueStrategy
document.id.strategy.partial.value.projection.list = guid,feedId
writemodel.strategy     = com.mongodb.kafka.connect.sink.writemodel.strategy.ReplaceOneDefaultStrategy
.....

# JSON with version, commit, etc.
curl http://localhost:8083/     

# State of the connector
curl -s http://localhost:8083/connectors/rss_nyt/status | jq '.connector.state'
There is a consumer offset issue- there is an offset pointer for each topic - if you delete the DB collection it won't rewrite what it's already written - you need to delete and docker compose the containers - there could be a workaround with the CONSUMER_OFFSET flag in docker compose file
