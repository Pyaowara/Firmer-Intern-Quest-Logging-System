#!/bin/bash
echo "Waiting for MongoDB to be ready..."
sleep 5
mongoimport --host localhost --db firmer --collection user --file /docker-entrypoint-initdb.d/internQuest.user.json --jsonArray
mongoimport --host localhost --db firmer --collection log --file /docker-entrypoint-initdb.d/internQuest.log.json --jsonArray
