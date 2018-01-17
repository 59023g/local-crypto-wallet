// client.js
// mep.im
// coin_wallet-v0
// 20180801
// license: MIT

/*
TODO
- deploy
- sort options
- historical buy/sell
- cash option
- keyup interactions on input
- about page
- donations
- https
*/


// init
window.onload = async () => {
  await initAndHandleWebSocket()
  await lookForURLQueryString()
  await renderAllEntries()
}

/* init webSocket and handle incoming messages
 */
const initAndHandleWebSocket = async () => {
  let socket = new WebSocket( `ws://${ location.host }` )
  // Connection opened
  socket.addEventListener( 'open', function ( event ) {
    socket.send( 'client_connected' );
  } );

  // Listen for messages
  socket.addEventListener( 'message', function ( event ) {
    console.log( 'ws: data received' )
    handleBinanceTickerData( JSON.parse( event.data ) )
  } );

}

/*

*/
const writeToLocalStorage = async () => {
  try {
    let entry = {}
    entry.id = await setId()

    // validate and parse date - necessary for getting estimated crypto prices, and
    entry.input_date_then = await validateParseDate( document.querySelector( '#input_date_then' ).value )
    // console.log( entry.input_date_then)
    // validate, parse, and assign input_symbol_pair
    Object.assign( entry, await validateParseSymbol( document.querySelector( '#input_symbol_pair' ).value ) )
    // input_quantity
    entry.input_quantity = +document.querySelector( '#input_quantity' ).value
    // input price per share ( base currency agnostic )
    entry.input_price_crypto_then_share = +document.querySelector( '#input_price_crypto_then_share' ).value
    // estimate crypto value in usd based on input date
    entry.meta_price_est_crypto_then_usd = await getEstimateCryptoUSD( entry )
    // price per share, either inputted or estimated, creates meta_price_crypto_then_usd if usd value input because we then know the exact value
    Object.assign( entry, await getEstimateCryptoUSDShare( entry, document.querySelector( '#input_price_usd_then_share' ).value ) )
    // totals in usd and crypto
    Object.assign( entry, await calculateEntryTotals( entry ) )
    // exchange value - not used right now
    entry.input_exchange = document.querySelector( '#input_exchange' ).value

    console.log( entry )

    // save to localStorage
    localStorage.setItem( entry.id, JSON.stringify( entry ) )
    // render new entry
    await appendEntryToTable( entry )
    // clear form ( including reset errors )
    clearForm()

  } catch ( error ) {
    console.error( 'writeToLocalStorage()', error )
    document.querySelector( '#writeToLocalStorage-notification' ).textContent = error
  }

}


// simple id counter based on localStorage length
const setId = async () => {
  let localStorageLength = localStorage.length
  if ( localStorageLength === 0 ) return 0
  else return localStorageLength++
}

// basic date validation
const validateParseDate = async ( input_date_then ) => {
  let rawDate = new Date( input_date_then )
  if ( !input_date_then ) { throw 'Date: Cannot be empty' }
  if ( isNaN( rawDate ) ) {
    throw 'Date: Not a number'
  }
  // Binance fix where it doesn't include date
  if ( rawDate.getFullYear() === 2001 ) {
    rawDate.setFullYear( 2018 )
  }
  return Date.parse( rawDate )
}


// export json url to text area and auto copy
const exportJsonUrl = async () => {
  let entries = []
  for ( let i = 0; i < localStorage.length; i++ ) {
    // existing entry data
    entries.push( localStorage.getItem( [ i ] ) )
  }

  let textArea = document.querySelector( '#dom_export_json_url' )
  // show textarea, add url, select it, then copy it to clipboard
  textArea.className = 'show'
  textArea.value = encodeURI( `${ location.origin }?json=[${ entries  }]` )
  textArea.select()
  document.execCommand( 'copy' )
}


/*
 looks for url querystring, if it's there and the localStorage entries do not exist,
 save to localStorage
 */
const lookForURLQueryString = async () => {
  try {
    // get params
    var url = new URL( document.location.href )
    var json = JSON.parse( url.searchParams.get( 'json' ) );

    if ( json ) {
      // if json params, load into local storage
      for ( var i = 0; i < json.length; i++ ) {

        // check if already exists
        if ( localStorage.getItem( json[ i ].id ) ) {
          return
        }
        // TODO maybe do a diff or something
        localStorage.setItem( json[ i ].id, JSON.stringify( json[ i ] ) )
        // await appendEntryToTable( json[ i ] )
      }
    }
  } catch ( error ) {
    console.error( 'lookForURLQueryString()', error )
  }
}


// calculates totals of an entry for usd and crypto
// TODO - estimate notation
const calculateEntryTotals = async ( entry ) => {
  return { meta_total_then_entry_crypto: entry.input_quantity * entry.input_price_crypto_then_share, meta_total_then_entry_usd: entry.input_quantity * entry.input_price_usd_then_share }
}

// TODO refactor
// doCalculations() ?
// renderDom() ?
const handleBinanceTickerData = async ( binanceTickerData ) => {

  try {
    let BTCUSDTnow
    let ETHUSDTnow
    // start counter for meta
    let total_est_usd_value = 0
    let total_est_now_usd_value = 0

    let dom_total_est_now_usd_value = document.querySelector( `#dom_meta_total_usd_now` )
    let existing_total_est_now_usd_value = +dom_total_est_now_usd_value.textContent.substr( 1 )

    // pull up localstorage
    for ( let i = 0; i < localStorage.length; i++ ) {

      // existing entry data
      let entry = JSON.parse( localStorage.getItem( [ i ] ) )

      // console.log( entry )
      // define dom nodes associated with entry
      let base_currency = entry.meta_base_currency

      let dom_meta_price_usd_now = document.querySelector( `#entry-${ entry.id } > .dom_meta_price_usd_now` )
      let dom_meta_price_crypto_now = document.querySelector( `#entry-${ entry.id } > .dom_meta_price_crypto_now` )
      let dom_meta_total_usd_now = document.querySelector( `#entry-${ entry.id } > .dom_meta_total_usd_now` )
      let dom_total_est_usd_value = document.querySelector( `#total_est_usd_value` )

      // console.dir(base_currency, dom_meta_price_crypto_now )

      let existing_now_price = dom_meta_price_crypto_now.textContent.substr( 1 )
      let existing_now_price_usd = dom_meta_price_usd_now.textContent.substr( 1 )
      let existing_total_est_now_usd = dom_meta_total_usd_now.textContent.substr( 1 )

      // loop through ticker objects
      for ( let l in binanceTickerData ) {

        // get usdtnow
        if ( binanceTickerData[ l ].symbol === 'BTCUSDT' ) {
          BTCUSDTnow = +binanceTickerData[ l ].price
        }

        //get usdtethnow
        if ( binanceTickerData[ l ].symbol === 'ETHUSDT' ) {
          ETHUSDTnow = +binanceTickerData[ l ].price
        }

        // console.log( 'BTCUSDTnow', BTCUSDTnow,  'ETHUSDTnow', ETHUSDTnow )



        // console.log( entry )
        // look for a symbol pair match
        if ( binanceTickerData[ l ].symbol === entry.input_symbol_pair ) {



          // console.log( binanceTickerData[ l ].symbol, entry.input_symbol_pair )
          let now_price_crypto = `${ +binanceTickerData[ l ].price }`
          let now_price_usd = `${ round( +binanceTickerData[ l ].price * +BTCUSDTnow, 4 ) }`
          let now_total_usd = `${ round( +binanceTickerData[ l ].price * +BTCUSDTnow * +entry.input_quantity, 2 ) }`

          if ( binanceTickerData[ l ].symbol === 'BTCUSDT' ) {
            now_price_crypto = 1
            now_price_usd = `${ round( +BTCUSDTnow, 4 ) }`
            now_total_usd = `${ round( +binanceTickerData[ l ].price * +entry.input_quantity, 2 ) }`
          }

          // if ( binanceTickerData[ l ].symbol === 'BTCUSDT' ) {
          //   dom_meta_price_crypto_now.textContent = `null`
          //   dom_meta_price_usd_now.textContent = `$${ round( BTCUSDTnow, 4 ) }`
          //   return
          // }
          // assign dom value with price
          total_est_usd_value += entry.meta_total_then_entry_usd

          dom_meta_price_usd_now.textContent = `$${ now_price_usd }`
          dom_meta_price_crypto_now.textContent = `${ await getCryptoBase( entry )}${ now_price_crypto }`
          dom_meta_total_usd_now.textContent = `$${ now_total_usd }`
          // i dont know why i need to serialize this
          total_est_now_usd_value += +now_total_usd

          // btc price - show color based on value change
          if ( now_price_crypto > existing_now_price ) {
            dom_meta_price_crypto_now.className = 'table-cell mobile-cell highlight-cell dom_meta_price_crypto_now green'
          } else if ( now_price_crypto < existing_now_price ) {
            dom_meta_price_crypto_now.className = 'table-cell mobile-cell dom_meta_price_crypto_now highlight-cell red'
          } else {
            dom_meta_price_crypto_now.className = 'table-cell mobile-cell  highlight-cell dom_meta_price_crypto_now nochange'
          }

          // current price usd show color based on value change
          if ( now_price_usd > existing_now_price_usd ) {
            dom_meta_price_usd_now.className = 'table-cell mobile-cell highlight-cell dom_meta_price_usd_now green'
          } else if ( now_price_usd < existing_now_price_usd ) {
            dom_meta_price_usd_now.className = 'table-cell mobile-cell highlight-cell dom_meta_price_usd_now red'
          } else {
            dom_meta_price_usd_now.className = 'table-cell mobile-cell highlight-cell dom_meta_price_usd_now nochange'
          }

          // current price usd show color based on value change
          if ( now_total_usd > existing_total_est_now_usd ) {
            dom_meta_total_usd_now.className = 'table-cell mobile-cell highlight-cell dom_meta_total_usd_now green'
          } else if ( now_total_usd < existing_total_est_now_usd ) {
            dom_meta_total_usd_now.className = 'table-cell mobile-cell highlight-cell dom_meta_total_usd_now red'
          } else {
            dom_meta_total_usd_now.className = 'table-cell mobile-cell highlight-cell dom_meta_total_usd_now nochange'
          }

        }
      }

      // current price usd show color based on value change
      if ( total_est_now_usd_value > existing_total_est_now_usd_value ) {
        dom_total_est_now_usd_value.className = 'mobile-fs-36 green'
      } else if ( total_est_now_usd_value < existing_total_est_now_usd_value ) {
        dom_total_est_now_usd_value.className = 'mobile-fs-36 red'
      } else {
        dom_total_est_now_usd_value.className = 'mobile-fs-36 nochange'
      }

      dom_total_est_usd_value.textContent = `$${ round( total_est_usd_value, 2 ) } `
      dom_total_est_now_usd_value.textContent = `$${ round( total_est_now_usd_value, 2 ) } `

    }
  } catch ( error ) {
    console.error( 'handleBinanceTickerData', error )
  }

}


const domRenderPriceUSDNow = async () => {




}

// basic date render for HTML
const domFormatDate = async ( date ) => {
  let test = new Date( date )
  testObj = {
    day: addZeroLeftPad( test.getDate() ),
    month: addZeroLeftPad( test.getMonth() + 1 ),
    year: test.getFullYear(),
    hour: addZeroLeftPad( test.getHours() ),
    minute: addZeroLeftPad( test.getMinutes() )
  }
  let options = { hour12: false, hour: 'numeric' }
  return `${ testObj.year }/${ testObj.month }/${ testObj.day } ${ testObj.hour }:${ testObj.minute }`
}

const addZeroLeftPad = ( value ) => {
  const stringVal = value.toString()
  if ( stringVal.length === 1 ) return '0' + stringVal
  return value
}

// first validate input symbol pair, then break it apart into quote and base currencies
const validateParseSymbol = async ( input_symbol_pair ) => {
  // check for forward slash, remove if, then uppercase
  let formattedSymbol = input_symbol_pair.replace( /\//i, '' ).toUpperCase()

  let meta_base_currency, meta_quote_currency

  if ( formattedSymbol.length < 6 || formattedSymbol.length > 8 ) throw 'Symbol: Must be 6 to 8 characters long'
  if ( window.binance_symbols.indexOf( formattedSymbol ) === -1 ) throw `Symbol: ${ formattedSymbol } Not found on Binance. Contact hi@mep.im if interested in more exchanges.`

  meta_base_currency = formattedSymbol.slice( -3 )
  meta_quote_currency = formattedSymbol.slice( 0, -3 )

  // check if usdt
  if ( meta_base_currency === 'SDT' ) {
    meta_base_currency = formattedSymbol.slice( -4 )
    meta_quote_currency = formattedSymbol.slice( 0, -4 )

  }

  return { input_symbol_pair: formattedSymbol, meta_quote_currency: meta_quote_currency, meta_base_currency: meta_base_currency }
}


const renderAllEntries = async () => {
  let entriesDiv = document.querySelector( '#entries' )
  for ( let i = 0; i < localStorage.length; i++ ) {
    let entry = JSON.parse( localStorage.getItem( [ i ] ) )
    console.log( entry )
    await appendEntryToTable( entry )
  }
}

//

const appendEntryToTable = async ( entry ) => {
  let entriesDiv = document.querySelector( '#entries' )
  entriesDiv.insertAdjacentHTML( 'beforeend', `
    <div id='entry-${ entry.id }' class='table table-10'>

      <div class="table-cell mobile-show mobile-header">Symbol Pair</div>
      <div class="table-cell mobile-cell highlight-cell">${ entry.meta_quote_currency }/${ entry.meta_base_currency }</div>

      <div class="table-cell mobile-show mobile-header">Price USD Now</div>
      <div class="table-cell mobile-cell highlight-cell dom_meta_price_usd_now"></div>

      <div class="table-cell mobile-show mobile-header">Price Crypto Now</div>
      <div class="table-cell table-cell--foot mobile-cell dom_meta_price_crypto_now"></div>

      <div class="table-cell mobile-show mobile-header">Quantity</div>
      <div class="table-cell mobile-cell">${ entry.input_quantity }</div>

      <div class="table-cell mobile-show mobile-header">Total USD Now</div>
      <div class="table-cell mobile-cell highlight-cell dom_meta_total_usd_now"></div>

      <div class="table-cell mobile-show mobile-header">Price Per Share</div>
      <div class="table-cell mobile-cell">
        ${ await domFormatCryptoPriceShare( entry.input_price_crypto_then_share, entry.meta_base_currency ) } <br> ${ await domFormatPriceCryptoThenShare( entry.input_price_usd_then_share, entry.meta_price_crypto_then_usd ) }
      </div>

      <div class="table-cell mobile-show mobile-header">Totals Then</div>
      <div class="table-cell mobile-cell">${ await domFormatEntryTotals( entry ) }</div>

      <div class="table-cell mobile-show mobile-header">Price Crypto Then</div>
      <div class="table-cell mobile-cell">${ await domFormatCryptoPriceUSD( entry.meta_price_crypto_then_usd, entry.meta_price_est_crypto_then_usd, entry.meta_base_currency ) }</div>

      <div class="table-cell mobile-show mobile-header">Date Then</div>
      <div class="table-cell mobile-cell">${ await domFormatDate( entry.input_date_then ) }</div>


      <div class="table-cell mobile-show mobile-header">Exchange</div>
      <div class="table-cell table-cell--foot mobile-cell">${ entry.input_exchange } <div onclick='remove( ${ entry.id }, event )'>del</div></div>

    </div>
  ` )
}

const domFormatEntryTotals = async ( entry ) => {
  let crypto_total_then = `${ await getCryptoBase( entry ) }${ round( entry.input_quantity * entry.input_price_crypto_then_share, 2 ) } <br> `
  let usd_total_then = `$${ round( entry.input_quantity * entry.input_price_usd_then_share, 2 ) } `
  return crypto_total_then + usd_total_then

}

const getCryptoBase = async ( entry, type ) => {
  if ( entry.meta_base_currency === 'ETH' ) return 'Ξ'
  if ( entry.meta_base_currency === 'BTC' ) return 'Ƀ'
  if ( entry.meta_base_currency === 'USDT' && entry.meta_quote_currency === 'BTC' ) return 'Ƀ'
  if ( entry.meta_base_currency === 'USDT' && entry.meta_quote_currency === 'ETH' ) return 'Ξ'
}

const domFormatCryptoPriceUSD = async ( meta_price_crypto_then_usd, meta_price_est_crypto_then_usd, meta_base_currency ) => {

  if ( meta_price_crypto_then_usd ) return `${ meta_base_currency }/USDT $${ round( meta_price_crypto_then_usd, 2 ) }`
  return `${ meta_base_currency }/USDT ${ round( meta_price_est_crypto_then_usd, 2 ) } (est)`

}

// basically add note of estimate if this price was calculated by meta
const domFormatPriceCryptoThenShare = async ( input_price_usd_then_share, meta_price_crypto_then_usd ) => {
  if ( meta_price_crypto_then_usd ) return `$${ round( input_price_usd_then_share, 2 ) }`
  return `$${ round( input_price_usd_then_share, 2 ) } (est)`
}

const domFormatCryptoPriceShare = async ( input_price_crypto_then_share, meta_base_currency ) => {
  if ( meta_base_currency === 'BTC' ) return `Ƀ${ input_price_crypto_then_share }`
  if ( meta_base_currency === 'ETH' ) return `Ξ${ input_price_crypto_then_share }`
  if ( meta_base_currency === 'USDT' ) return `$${ input_price_crypto_then_share }`
}


const getMetaTotals = async ( entry ) => {


}


const remove = async ( id, event ) => {
  localStorage.removeItem( id )
  entry = document.querySelector( `#entry-${ id }` )
  entry.parentNode.removeChild( entry );
}


// this takes validated date, rounds it to nearest UTC day, then searches historical data depending on base currency
const getEstimateCryptoUSD = async ( entry ) => {

  // rounds input_date_then to nearest day UTC TODO - verify
  let roundDate = new Date( entry.input_date_then )
  roundDate.setUTCHours( 0 )
  roundDate.setUTCMinutes( 0 )
  roundDate.setUTCSeconds( 0 )
  roundDate.setUTCMilliseconds( 0 )
  roundDate = Date.parse( new Date( roundDate ).toISOString() ) / 1000

  // if eth base currency, look for close value at time input_date_then
  if ( entry.meta_base_currency === 'ETH' ) {
    for ( let x in window.eth_historical ) {
      if ( window.eth_historical[ x ].date === roundDate ) {
        console.log( 'here', window.eth_historical[ x ].close )
        return window.eth_historical[ x ].close
      }
    }
  }

  // if btc base currency , look for close value at time input_date_then
  if ( entry.meta_base_currency === 'BTC' || entry.meta_base_currency === 'USDT' ) {
    for ( let x in window.btc_historical ) {
      if ( window.btc_historical[ x ].date === roundDate ) {
        console.log( 'here', window.btc_historical[ x ].close )
        return window.btc_historical[ x ].close
      }
    }
  }
}

// returns input usd per share value or the estimate
const getEstimateCryptoUSDShare = async ( entry, input_price_usd_then_share ) => {
  if ( input_price_usd_then_share ) return { input_price_usd_then_share: input_price_usd_then_share, meta_price_crypto_then_usd: input_price_usd_then_share / entry.input_price_crypto_then_share }
  return { input_price_usd_then_share: entry.meta_price_est_crypto_then_usd * entry.input_price_crypto_then_share }
}

const getCostUSD = async ( user_defined, avg_btc_day, cost_per_share_btc ) => {
  if ( user_defined ) { console.log( 'user' ); return user_defined }
  return cost_per_share_btc * avg_btc_day
}

const clearForm = () => {
  document.querySelector( '#input_date_then' ).value = null
  document.querySelector( '#input_symbol_pair' ).value = null
  document.querySelector( '#input_price_crypto_then_share' ).value = null
  document.querySelector( '#input_quantity' ).value = null
  document.querySelector( '#input_price_usd_then_share' ).value = null
  document.querySelector( '#input_exchange' ).value = null
  document.querySelector( '#writeToLocalStorage-notification' ).textContent = ''
}

document.onkeydown = function KeyPress( e ) {
  var evtobj = window.event ? event : e
  // console.log( evtobj )
  // clear localStorage on ctrl+c
  if ( evtobj.keyCode == 67 && evtobj.ctrlKey ) {
    clearLocalStorage()
  }
  //display all localStorage items ctrl+a
  if ( evtobj.keyCode == 65 && evtobj.ctrlKey ) {
    console.info( 'localStorage: all items' )
    renderAllEntries();
  }
}

const clearLocalStorage = async () => {
  console.info( 'localStorage: cleared' )
  localStorage.clear();
  document.location.replace( '/' )
}

function round( value, decimals ) {
  return Number( Math.round( value + 'e' + decimals ) + 'e-' + decimals );
}
