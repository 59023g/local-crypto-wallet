// http_logger.js
// adapted from budo logger https://github.com/mattdesl/budo/blob/master/lib/simple-http-logger.js
const log = require( 'bole' )( 'http_logger' )
const on_headers = require( 'on-headers' )
const on_finished = require( 'on-finished' )

function simpleHttpLogger( req, res, next ) {
  // if ( httpLogger.ignores.indexOf( req.url ) >= 0 ) return next()
  if ( !req.url ) return next()

  // request data
  req._startAt = undefined

  // response data
  res._startAt = undefined

  // record request start
  recordStartTime.call( req )

  var byteLength = 0

  var logRequest = function () {
    if ( !req._startAt || !res._startAt ) {
      // missing request and/or response start time
      return
    }

    // calculate diff
    var ms = ( res._startAt[ 0 ] - req._startAt[ 0 ] ) * 1000 +
      ( res._startAt[ 1 ] - req._startAt[ 1 ] ) * 1e-6

    log.info( {
      elapsed: ms,
      contentLength: byteLength,
      method: ( req.method || 'GET' ).toUpperCase(),
      url: req.url,
      statusCode: res.statusCode,
      // type: httpLogger.type === 'static' ? undefined : httpLogger.type,
      colors: {
        elapsed: ms > 1 ? 'yellow' : 'dim'
      }
    } )
  }

  var isAlreadyLogging = res._simpleHttpLogger
  res._simpleHttpLogger = true

  if ( !isAlreadyLogging ) {
    // record response start
    on_headers( res, recordStartTime )

    // log when response finished
    on_finished( res, logRequest )

    var writeFn = res.write

    // catch content-length of payload
    res.write = function ( payload ) {
      if ( payload ) byteLength += payload.length
      return writeFn.apply( res, arguments )
    }
  }

  next()
}



function recordStartTime() {
  this._startAt = process.hrtime()
}


module.exports = simpleHttpLogger
