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

var _ = require('underscore');
var Db = require('@saio/db-component');
var Wsocket = require('@saio/wsocket-component');
var Config = require('./config.js');

var AppLogQueryService = function(container, options) {
  var config = Config.build(options);
  this.db = container.use('db', Db, config.db);
  this.ws = container.use('ws', Wsocket, config.ws);
};

AppLogQueryService.prototype.start = function() {
  return this.ws.register('fr.saio.service.applog.query',
    this.query.bind(this),
    { invoke: 'roundrobin' })
  .tap(function() {
    console.log('applog query service started');
  });
};

AppLogQueryService.prototype.stop = function() {
  return this.ws.unregister()
  .tap(function() {
    console.log('applog query service stopped');
  });
};

/**
 * kwargs.query: string, mandatory, sql query string
 */
AppLogQueryService.prototype.query = function(args, kwargs) {
  if (!_.isString(kwargs.query)) {
    throw new Error('invalid query: must be a string');
  }
  return this.db.sequelize.query(kwargs.query, { type: this.db.sequelize.QueryTypes.SELECT });
};

module.exports = AppLogQueryService;
