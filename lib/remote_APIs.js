// binance_rest.js

const r = require( 'request' )
const request = require( 'request-promise' )

String.prototype.lpad = function(padString, length) {
    var str = this;
    while (str.length < length)
        str = padString + str;
    return str;
}

const getBinanceTickerNow = async () => {
  try {
    return await request( `https://api.binance.com/api/v3/ticker/price` )
  } catch ( error ) {
    console.log( 'error', error )
  }
}

const getHistoricalBTC = async () => {
  // let nowCoindesk = await formatDateForCoindesk( new Date() )
  try {
    return await request( `https://poloniex.com/public?command=returnChartData&currencyPair=USDT_BTC&start=1435699200&end=9999999999&period=86400` )
  } catch ( error ) {
    console.error( 'error', error )
  }
}

const getHistoricalETH = async () => {
  try {
    return await request( `https://poloniex.com/public?command=returnChartData&currencyPair=USDT_ETH&start=1435699200&end=9999999999&period=86400` )
  } catch ( error ) {
    console.error( 'error', error )
  }
}

module.exports = {
  getBinanceTickerNow: getBinanceTickerNow,
  getHistoricalBTC: getHistoricalBTC,
  getHistoricalETH: getHistoricalETH
}
