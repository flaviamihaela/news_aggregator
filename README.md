curl -i http://localhost:8083/connectors

curl -X POST http://localhost:8083/connectors      -H "Content-Type: application/json"      -d '{
           "name": "RssSourceConnectorDemo",
           "config": {
             "connector.class": "org.kaliy.kafka.connect.rss.RssSourceConnector",
             "tasks.max": "2",
             "rss.urls": "https://medium.com/feed/@markmanson",
             "topic": "RSS"
           }
           
curl -X POST http://localhost:8083/connectors \
     -H "Content-Type: application/json" \
     -d '{
           "name": "MongoSinkConnectorDemo",
           "config": {
             "connector.class": "com.mongodb.kafka.connect.MongoSinkConnector",
             "tasks.max": "2",
             "topics": "RSS",
             "connection.uri": "mongodb+srv://username:password@cluster.mongodb.net/project",
             "database": "project",
             "collection": "articles",
             "max.batch.size": "10",
           }
         }'
docker exec kafkacat kafkacat     -b broker:29092     -t RSS     -C -o beginning


There is a consumer offset issue- there is an offset pointer for each topic - if you delete the DB collection it won't rewrite what it's already written - you need to delete and docker compose the containers - there could be a workaround with the CONSUMER_OFFSET flag in docker compose file
