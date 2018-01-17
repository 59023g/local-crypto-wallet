// index.js

require( 'dotenv' ).config()
const path = require( 'path' )

// server
const express = require( 'express' )
const http = require( 'http' )
const app = express()
app.disable( 'x-powered-by' )

// TODO this is an issue
app.use( express.static( process.cwd() + '/lib/public' ) );

// Websocket
const WebSocket = require( 'ws' )
const server = http.createServer( app )
const wss = new WebSocket.Server( { server } )

// logging
const bole = require( 'bole' )
const http_logger = require( './http_logger' )
bole.output( { level: 'info', stream: process.stdout } )
app.use( async ( req, res, next ) => { http_logger( req, res, next ) } )

// start server
server.listen( process.env.PORT )

// binance api request
const remoteAPIs = require( './remote_APIs' )

// hit binance API every second
let binancePriceData = []
setInterval( async () => {
  binancePriceData = await remoteAPIs.getBinanceTickerNow()
}, 1000 )

wss.on( 'connection', ( ws, req ) => {
  const ip = req.connection.remoteAddress;
  ws.on( 'message', ( message ) => {
    console.log( message + ip);
  } );

  // https://github.com/websockets/ws/issues/1256
  ws.on( 'error', ( error ) => console.log( 'errored', error ) );

  setInterval( () => {
    if ( ws.readyState === WebSocket.OPEN ) {
      return ws.send( binancePriceData )
    }
  }, 1000 )

} );


// routes
const view_controller = require( './view_controller' )
app.get( '/', async ( req, res ) => {
  res.send( await view_controller( 'index' )  )
} )
