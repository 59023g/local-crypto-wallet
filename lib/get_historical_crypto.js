// cron get get_historical_btc.js
const fs = require( 'fs' )
const remoteAPIs = require( './remote_APIs' )

remoteAPIs.getHistoricalBTC()
  .then( results => {
    fs.writeFileSync( "btc_historical.json", JSON.stringify( results ), "utf8" );
  } )

remoteAPIs.getHistoricalETH()
  .then( results => {
    fs.writeFileSync( "eth_historical.json", JSON.stringify( results ), "utf8" );
  } )

  remoteAPIs.getBinanceTickerNow()
  .then( results => {
    console.log( results )
    fs.writeFileSync( "ticker.json",  JSON.stringify( results ), "utf8" );

  })
