#!/bin/env bash

# install
docker build -t applog-query-base -f tasks/integration/dockerfiles/baseDockerfile .;
docker build -t applog-query-crossbar -f tasks/integration/dockerfiles/crossbarDockerfile .;
docker build -t applog-query-service -f tasks/integration/dockerfiles/applogQueryDockerfile .;
docker build -t applog-query-test -f tasks/integration/dockerfiles/testDockerfile .;

# start services
echo "starting database...";
docker run -d \
	--name applog-query-db \
	memsql/quickstart;
sleep 15;
docker run --rm --link applog-query-db:memsql memsql/quickstart memsql-shell -e "create database test"

echo "starting crossbar...";
docker run -d \
  --name applog-query-crossbar \
  applog-query-crossbar;
sleep 10;

echo "starting applog-query-service...";
docker run -d \
  --name applog-query-service \
  --link applog-query-db:db \
  --link applog-query-crossbar:crossbar \
  applog-query-service;
sleep 10;

echo "running test...";
docker run \
  --name applog-query-test \
  --link applog-query-db:db \
  --link applog-query-crossbar:crossbar \
  applog-query-test;
TEST_EC=$?;

# return with the exit code of the test
if [ $TEST_EC -eq 0 ]
then
  echo "It Saul Goodman !";
  exit 0;
else
  exit $TEST_EC;
fi
