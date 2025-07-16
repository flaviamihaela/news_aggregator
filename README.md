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
          "connection.uri": "your_mongo_connection_uri",
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
    "connection.uri": "your_mongo_connection_uri",
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


<img width="2427" height="1472" alt="image" src="https://github.com/user-attachments/assets/b79dbf84-400b-4e15-b346-57db49da59e2" />
<img width="2465" height="835" alt="image" src="https://github.com/user-attachments/assets/ca857c54-bbb9-44bc-8b0f-f776a99dc84e" />
<img width="2581" height="1481" alt="image" src="https://github.com/user-attachments/assets/b4058311-0927-4b48-b6ea-95bdfede295c" />
<img width="1633" height="646" alt="image" src="https://github.com/user-attachments/assets/6eaa6752-afb1-4866-a3d1-3740ca8d0665" />
<img width="1901" height="1184" alt="image" src="https://github.com/user-attachments/assets/a67f6ee4-6caa-4eee-91ee-f4fb1b45ddc8" />


# JSON with version, commit, etc.
curl http://localhost:8083/     

# State of the connector
curl -s http://localhost:8083/connectors/rss_nyt/status | jq '.connector.state'

