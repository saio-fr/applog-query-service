/*-------------------------------------------------*\
 |                                                 |
 |      /$$$$$$    /$$$$$$   /$$$$$$   /$$$$$$     |
 |     /$$__  $$  /$$__  $$ |_  $$_/  /$$__  $$    |
 |    | $$  \__/ | $$  \ $$   | $$   | $$  \ $$    |
 |    |  $$$$$$  | $$$$$$$$   | $$   | $$  | $$    |
 |     \____  $$ | $$__  $$   | $$   | $$  | $$    |
 |     /$$  \ $$ | $$  | $$   | $$   | $$  | $$    |
 |    |  $$$$$$/ | $$  | $$  /$$$$$$ |  $$$$$$/    |
 |     \______/  |__/  |__/ |______/  \______/     |
 |                                                 |
 |                                                 |
 |                                                 |
 |    *---------------------------------------*    |
 |    |   © 2015 SAIO - All Rights Reserved   |    |
 |    *---------------------------------------*    |
 |                                                 |
\*-------------------------------------------------*/

var when = require('when');
var _ = require('underscore');
var tape = require('blue-tape');
var WSocket = require('@saio/wsocket-component');
var Db = require('@saio/db-component');
var TestContainer = require('@saio/service-runner').Tester;
var config = require('./config.json');

var TestService = function(container) {
  this.ws = container.use('ws', WSocket, config.ws);
  this.db = container.use('db', Db, config.db);
};

TestService.prototype.run = function(query) {
  return this.ws.call('fr.saio.service.applog.query', [], { query: query });
};

// add an event to the db
TestService.prototype.start = function() {
  return this.db.model.Log.create({
    name: 'message',
    userId: 'johnDoe',
    timestamp: 42,
    properties: JSON.stringify({ body: 'Hello World !', license: 'pouetpouet' })
  });
};

tape('applog-query-service integration test', function(t) {
  var testServiceInstance;

  function test(query) {
    return testServiceInstance.service.run(query);
  }

  t.test('connect test environment', function() {
    testServiceInstance = new TestContainer(TestService);
    return testServiceInstance.start();
  });

  t.test('query', function(st) {
    var query =
      'SELECT timestamp, JSON_EXTRACT_STRING(properties, "body") AS body FROM Logs ' +
      'WHERE name = "message" AND userID = "johnDoe" AND ' +
        'JSON_EXTRACT_STRING(properties, "license") = "pouetpouet"';
    var expectedRow = {
      timestamp: 42,
      body: 'Hello World !'
    };
    return test(query)
    .then(function(rows) {
      st.equal(rows.length, 1);
      st.deepEqual(rows[0], expectedRow);
      return when.resolve();
    });
  });

  t.test('disconnect test environment', function() {
    return testServiceInstance.stop();
  });
});
