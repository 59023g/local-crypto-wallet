// binance_rest.js

const request = require( 'request-promise' )

const getBinanceTickerPrice = async () => {
  try {
    return await request( `https://api.binance.com/api/v3/ticker/price` )
  } catch ( error ) {
    console.log( 'error', error )
  }
}


module.exports = getBinanceTickerPrice
