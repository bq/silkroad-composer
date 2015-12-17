/* ************************************
  Server Config and Load
**************************************/
'use strict'

var restify = require('restify')
var hub = require('./lib/hub')
var srvConf = require('./lib/server')
var server = restify.createServer(srvConf)
require('./lib/router')(server)
var engine = require('./lib/engine')
var WorkerClass = require('./lib/worker')
var config = require('./lib/config')
var configChecker = require('./utils/envConfigChecker')
var worker = new WorkerClass()
var logger = require('./utils/composrLogger')
var ComposrError = require('./lib/ComposrError')

/* ************************************
  Configuration check
**************************************/
var env = process.env.NODE_ENV || 'development'
configChecker.checkConfig(env)

/* ************************************
  Error handlers
**************************************/
logger.info('Loading Middlewares...')
require('./middlewares')(restify, server, config, logger)

/* ************************************
  Error handlers
**************************************/

server.on('NotFound', function (req, res, err, next) {
  err.body = new ComposrError('error:not_found', err.message, 404)
  res.send(404, err)
  return next()
})

server.on('InternalServer', function (req, res, err, next) {
  err.body = new ComposrError('error:internal:server:error', err.message, 500)
  res.send(500, err)
  return next()
})

server.on('Internal', function (req, res, err, next) {
  err.body = new ComposrError('error:internal:server:error', err.message, 500)
  res.send(500, err)
  return next()
})

server.on('uncaughtException', function (req, res, err, next) {
  console.log(err)
  err.body = new ComposrError('error:internal:server:error', err.message, 500)
  res.send(500, err)
  return next()
})

process.on('uncaughtException', function (err) {
  logger.debug('Error caught by uncaughtException', err)
  logger.error(err)
  if (!err || err.message !== "Can't set headers after they are sent.") {
    process.exit(1)
  }
})

/* ************************************
  Initialization
**************************************/

// Trigger the worker execution
worker.init()

// Trigger the static routes creation
hub.emit('create:staticRoutes', server)

module.exports = engine.init(server)
