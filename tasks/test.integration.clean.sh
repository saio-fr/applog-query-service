#!/bin/env bash

# stop
docker stop applog-query-service;
docker stop applog-query-crossbar;
docker stop applog-query-db;

# clean
docker rm applog-query-test;
docker rm applog-query-service;
docker rm applog-query-crossbar;
docker rm applog-query-db;

# uninstall
docker rmi applog-query-test;
docker rmi applog-query-service;
docker rmi applog-query-crossbar;
docker rmi applog-query-base;
