#! /bin/bash

if [ "$1" = "d" ]; then
   action="down"
   label="Deleting"
else
   action="up"
   label="Creating"
fi

echo "$action"

echo "$label Postgres container for app..."
docker-compose -f docker/postgres/docker-compose.yml "$action" -d

echo "$label Redis container for app..."
docker-compose -f docker/redis/docker-compose.yml "$action" -d

#echo "$label Logstash, Elasticsearch and Kibana container..."
#docker-compose -f docker/ELK/docker-compose.yml "$action" -d

echo "Done!"
