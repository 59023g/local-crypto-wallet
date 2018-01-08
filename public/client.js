// client.js
//
let socket = new WebSocket( 'ws://localhost:3000' )

// Connection opened
socket.addEventListener( 'open', function ( event ) {
  socket.send( 'client_connected' );
} );

// Listen for messages
socket.addEventListener( 'message', function ( event ) {
  console.log( 'ws: server message' )
  handleBinanceTickerData( JSON.parse( event.data ) )
} );

// init
window.onload = async () => {
  await renderAllEntries()
  await lookForQueryString()

}

const lookForQueryString = async () => {
  // get params
  let params = new URLSearchParams( document.location.search.substring( 1 ) );
  let json = JSON.parse( params.get( 'json' ) )
  if ( json ) {
    // if json params, load into local storage
    for ( var i = 0; i < json.length; i++ ) {
      // check if already exists
      if ( localStorage.getItem( json[ i ].id ) ) {
        return
      }
      localStorage.setItem( json[ i ].id, JSON.stringify( json[ i ] ) )
      await appendEntryToTable( json[ i ] )
    }
  }
}

const store = async () => {
  try {
    let entry = {}

    entry.id = await setId()
    entry.date = await validateDate( document.querySelector( '#date' ).value )
    entry.symbol = await validateSymbol( document.querySelector( '#symbol' ).value )
    entry.amount = +document.querySelector( '#amount' ).value

    entry.cost_per_share_btc = +document.querySelector( '#cost_btc' ).value
    entry.exchange = document.querySelector( '#exchange' ).value
    entry.est_btcusd = await getEstimateBTCUSD( entry.date )
    entry.cost_per_share_usd = await getCostUSD( document.querySelector( '#cost_usd' ).value, entry.est_btcusd, entry.cost_per_share_btc )
    entry.total_usd = entry.amount * entry.cost_per_share_usd
    entry.total_btc = entry.amount * entry.cost_per_share_btc

    // save to localStorage
    localStorage.setItem( entry.id, JSON.stringify( entry ) )
    // render new entry
    await appendEntryToTable( entry )
    // clear form ( including reset errors )
    clearForm()

  } catch ( error ) {
    console.error( 'store()', error )
    document.querySelector( '#submit-notification' ).textContent = error
  }

}

const exportJson = async () => {
  let entries = []
  for ( let i = 0; i < localStorage.length; i++ ) {
    // existing entry data
    entries.push( JSON.parse( localStorage.getItem( [ i ] ) ) )

  }
  document.querySelector( '#export_url' ).textContent = `${ location.href }?json=${ JSON.stringify( entries ) }`
}

// TODO refactor
const handleBinanceTickerData = async ( binanceTickerData ) => {

  let BTCUSDTnow
  // start counter for meta
  let total_est_usd_value = 0
  let total_est_now_usd_value = 0

  let dom_total_est_now_usd_value = document.querySelector( `#total_est_now_usd_value` )
  let existing_total_est_now_usd_value = +dom_total_est_now_usd_value.textContent.substr( 1 )

  // pull up localstorage
  for ( let i = 0; i < localStorage.length; i++ ) {

    // existing entry data
    let entry = JSON.parse( localStorage.getItem( [ i ] ) )

    // console.log( entry )
    // define dom nodes associated with entry
    let dom_now_price = document.querySelector( `#entry-${ entry.id } > .now_price` )
    let dom_now_price_usd = document.querySelector( `#entry-${ entry.id } > .now_price_usd` )
    let dom_now_total_usd = document.querySelector( `#entry-${ entry.id } > .now_total_usd` )
    let dom_total_est_usd_value = document.querySelector( `#total_est_usd_value` )

    let existing_now_price = dom_now_price.textContent.substr( 1 )
    let existing_now_price_usd = dom_now_price_usd.textContent.substr( 1 )
    let existing_total_est_now_usd = dom_now_total_usd.textContent.substr( 1 )

    // loop through ticker objects
    for ( let l in binanceTickerData ) {

      // get usdtnow
      if ( binanceTickerData[ l ].symbol === 'BTCUSDT' ) {
        BTCUSDTnow = +binanceTickerData[ l ].price
      }


      let now_price_btc = `${ +binanceTickerData[ l ].price }`
      let now_price_usd = `${ round( +binanceTickerData[ l ].price * +BTCUSDTnow, 4 ) }`
      let now_total_usd = `${ round( +binanceTickerData[ l ].price * +BTCUSDTnow * +entry.amount, 2 ) }`

      if ( binanceTickerData[ l ].symbol === 'BTCUSDT' ) {
        now_price_btc = 1
        now_price_usd = `${ round( +BTCUSDTnow, 4 ) }`
        now_total_usd = `${ round( +binanceTickerData[ l ].price * +entry.amount, 2 ) }`
      }

      // look for a symbol pair match
      if ( binanceTickerData[ l ].symbol === entry.symbol ) {

        // if ( binanceTickerData[ l ].symbol === 'BTCUSDT' ) {
        //   dom_now_price.textContent = `null`
        //   dom_now_price_usd.textContent = `$${ round( BTCUSDTnow, 4 ) }`
        //   return
        // }

        // btc price - show color based on value change
        if ( now_price_btc > existing_now_price ) {
          dom_now_price.className = 'table-cell mobile-cell now_price green'
        } else if ( now_price_btc < existing_now_price ) {
          dom_now_price.className = 'table-cell mobile-cell now_price red'
        } else {
          dom_now_price.className = 'table-cell mobile-cell now_price nochange'
        }

        // current price usd show color based on value change
        if ( now_price_usd > existing_now_price_usd ) {
          dom_now_price_usd.className = 'table-cell mobile-cell now_price_usd green'
        } else if ( now_price_usd < existing_now_price_usd ) {
          dom_now_price_usd.className = 'table-cell mobile-cell now_price_usd red'
        } else {
          dom_now_price_usd.className = 'table-cell mobile-cell now_price_usd nochange'
        }

        // current price usd show color based on value change
        if ( now_total_usd > existing_total_est_now_usd ) {
          dom_now_total_usd.className = 'table-cell mobile-cell now_total_usd green'
        } else if ( now_total_usd < existing_total_est_now_usd ) {
          dom_now_total_usd.className = 'table-cell mobile-cell now_total_usd red'
        } else {
          dom_now_total_usd.className = 'table-cell mobile-cell now_total_usd nochange'
        }

        // assign dom value with price
        total_est_usd_value += entry.total_usd
        dom_now_price.textContent = `Ƀ${ now_price_btc }`
        dom_now_price_usd.textContent = `$${ now_price_usd }`
        dom_now_total_usd.textContent = `$${ now_total_usd }`
        // i dont know why i need to serialize this
        total_est_now_usd_value += +now_total_usd


      }


    }

    // current price usd show color based on value change
    if ( total_est_now_usd_value > existing_total_est_now_usd_value ) {
      dom_total_est_now_usd_value.className = 'table-cell bg-g green'
    } else if ( total_est_now_usd_value < existing_total_est_now_usd_value ) {
      dom_total_est_now_usd_value.className = 'table-cell bg-g red'
    } else {
      dom_total_est_now_usd_value.className = 'table-cell bg-g nochange'
    }

    dom_total_est_usd_value.textContent = `$${ round( total_est_usd_value, 2 ) } `
    dom_total_est_now_usd_value.textContent = `$${ round( total_est_now_usd_value, 2 ) } `

  }

}


const setId = async () => {
  let localStorageLength = localStorage.length
  if ( localStorageLength === 0 ) return 0
  else return localStorageLength++
}

function convertDateToUTC( date ) {
  return new Date( date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds() );
}

const validateDate = async ( date ) => {
  let rawDate = new Date( date )

  if ( !date ) { throw 'Date: Cannot be empty' }
  if ( isNaN( rawDate ) ) {
    throw 'Date: Not a number'
  }

  let dateObj = {
    year: rawDate.getFullYear(),
    // month: rawDate.getMonth(),
    // day: rawDate.getDate(),
    // hours: rawDate.getHours(),
    // minutes: rawDate.getMinutes(),
    // seconds: rawDate.getSeconds(),
    // month: rawDate.getMonth(),
    // milliseconds: rawDate.getMilliseconds(),
  }

  // Binance fix where it doesn't include date
  if ( dateObj.year === 2001 ) {
    dateObj.year = 2018
    rawDate.setFullYear( 2018 )
  }

  return Date.parse( rawDate )

}

const renderDate = async ( date ) => {
  return new Date( date )
}

const validateSymbol = async ( symbol ) => {
  let formattedSymbol = symbol.toUpperCase()
  if ( formattedSymbol.length < 6 || formattedSymbol.length > 8 ) throw 'Symbol: Must be 6 to 8 characters long'
  if ( window.binance_symbols.indexOf( formattedSymbol ) === -1 ) throw `Symbol: ${ symbol } Not found`
  return formattedSymbol
}


const renderAllEntries = async () => {
  let entriesDiv = document.querySelector( '#entries' )
  for ( let i = 0; i < localStorage.length; i++ ) {
    let entry = JSON.parse( localStorage.getItem( [ i ] ) )
    await appendEntryToTable( entry )
  }
}


const appendEntryToTable = async ( entry ) => {
  let entriesDiv = document.querySelector( '#entries' )
  entriesDiv.insertAdjacentHTML( 'beforeend', `
    <div id='entry-${ entry.id }' class='table table-10'>

      <div class="table-cell bg-g mobile-show mobile-header">date</div>
      <div class="table-cell mobile-cell">${ await renderDate( entry.date ) }</div>

      <div class="table-cell bg-g mobile-show mobile-header">symbol pair</div>
      <div class="table-cell mobile-cell">${ entry.symbol }</div>

      <div class="table-cell bg-g mobile-show mobile-header">amount</div>
      <div class="table-cell mobile-cell">${ entry.amount }</div>

      <div class="table-cell bg-g mobile-show mobile-header">cost_per_share</div>
      <div class="table-cell mobile-cell">Ƀ${ entry.cost_per_share_btc } / $${ round( entry.cost_per_share_usd, 4 ) } </div>

      <div class="table-cell bg-g mobile-show mobile-header">est_btcusd</div>
      <div class="table-cell mobile-cell">$${ entry.est_btcusd }</div>

      <div class="table-cell bg-g mobile-show mobile-header">totals</div>
      <div class="table-cell mobile-cell">Ƀ${ round( entry.total_btc, 4 ) } / $${ round( entry.total_usd, 2 ) } </div>

      <div class="table-cell bg-g mobile-show mobile-header">current price usd</div>
      <div class="table-cell mobile-cell now_price_usd"> </div>

      <div class="table-cell bg-g mobile-show mobile-header">current price</div>
      <div class="table-cell mobile-cell now_price" > </div>

      <div class="table-cell bg-g mobile-show mobile-header">est current value usd</div>
      <div class="table-cell mobile-cell now_total_usd"></div>

      <div class="table-cell bg-g mobile-show mobile-header">exchange</div>
      <div class="table-cell table-cell--foot mobile-cell">${ entry.exchange } <div onclick='remove( ${ entry.id }, event )'>del</div></div>
    </div>
  ` )
}

const getMetaTotals = async ( entry ) => {


}


const remove = async ( id, event ) => {
  localStorage.removeItem( id )
  entry = document.querySelector( `#entry-${ id }` )
  entry.parentNode.removeChild( entry );
}

// this takes validated date, rounds it to nearest UTC day, then searches historical data
const getEstimateBTCUSD = async ( validatedDate ) => {
  let roundDate = new Date( validatedDate )

  roundDate.setUTCHours( 0 )
  roundDate.setUTCMinutes( 0 )
  roundDate.setUTCSeconds( 0 )
  roundDate.setUTCMilliseconds( 0 )

  roundDate = Date.parse( new Date( roundDate ).toISOString() )

  for ( let x in window.historical_btc ) {
    if ( window.historical_btc[ x ].x === roundDate / 1000 ) {
      return window.historical_btc[ x ].y
    }
  }
}


const getCostUSD = async ( user_defined, avg_btc_day, cost_per_share_btc ) => {
  if ( user_defined ) { console.log( 'user' ); return user_defined }
  return cost_per_share_btc * avg_btc_day
}

const clearForm = () => {
  document.querySelector( '#date' ).value = null
  document.querySelector( '#symbol' ).value = null
  document.querySelector( '#amount' ).value = null
  document.querySelector( '#cost_btc' ).value = null
  document.querySelector( '#cost_usd' ).value = null
  document.querySelector( '#exchange' ).value = null
  document.querySelector( '#submit-notification' ).textContent = ''
}

document.onkeydown = function KeyPress( e ) {
  var evtobj = window.event ? event : e
  // console.log( evtobj )
  // clear localStorage on ctrl+c
  if ( evtobj.keyCode == 67 && evtobj.ctrlKey ) {
    localStorage.clear();
    console.info( 'localStorage: cleared' )
  }
  //display all localStorage items ctrl+a
  if ( evtobj.keyCode == 65 && evtobj.ctrlKey ) {
    console.info( 'localStorage: all items' )
    renderAllEntries();
  }
}

function round( value, decimals ) {
  return Number( Math.round( value + 'e' + decimals ) + 'e-' + decimals );
}
