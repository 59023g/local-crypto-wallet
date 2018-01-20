// const historical_btc = require( '../btc_historical.json')
const fs = require( 'fs' )
// console.log( historical_btc )
let btc_historical = require( '../../btc_historical.json' )
let eth_historical = require( '../../eth_historical.json' )


module.exports = ( data ) => {
  return (
    `
      <!-- index.html -->
      <div id='entries'>
        <div class='table table-10 mobile-hide header-row'>

          <div class='table-cell'>symbol_pair</div>

          <div class='table-cell'>price_usd_now</div>

          <div class='table-cell'>price_crypto_now</div>

          <div class='table-cell'>quantity</div>

          <div class='table-cell'>total_usd_now</div>

          <div class='table-cell'>price_then_share</div>

          <div class='table-cell'>totals_then</div>

          <div class='table-cell'>price_base_then</div>
          <div class='table-cell'>date_then</div>
          <div class='table-cell'>exchange</div>
        </div>
      </div>

      <!-- totals - refactor -->
      <div class='table table-10 totals' id='totals' style='margin-bottom: 10px'>
        <div class='table-cell'></div>
        <div class='table-cell'></div>
        <div class='table-cell'></div>

        <!-- meta_total_usd_now header -->
        <div class='table-cell'>
          <span class='mobile-show'>meta_total_usd_now</span>
        </div>

        <!-- meta_total_usd_now -->
        <div class='table-cell display-flex fd-column overflow-visible data-bg meta-total-cell'>
          <span id='dom_meta_total_usd_now' class='mobile-fs-36'></span>
        </div>

        <div class='table-cell mobile-hide'></div>

        <div class='table-cell'>
          <span class='mobile-hide' id='total_est_usd_value'></span>
        </div>

        <div class='table-cell mobile-show'><span>built by <a href='http://mep.im'>hi@mep.im</a> - no data stored on server - <a href='https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage' target='_blank'>localStorage</a> - <a target='_blank' href='https://github.com/59023g/local-crypto-wallet'>code</a> (7kb)</span>
        </div>

        <div class='table-cell'></div>
        <div class='table-cell'></div>
        <div class='table-cell'></div>

      </div>
      <!-- end totals -->


      <!----------->
      <!-- input -->
      <!----------->
      <div id='input' style='margin-bottom: 40px; margin-top: 200px;'>

        <div class='df jf-start color-white' style='margin-bottom: 9px'>input</div>

        <div class="table table-2" style="height:6px;margin: 0">
          <div class="table-cell " style="border-top-left-radius: 4px;padding: 0;background: rgb(155, 155, 155);"></div>
          <div class="table-cell" style="border-top-right-radius: 4px;padding: 0;background: rgb(155, 155, 155);"></div>
        </div>

        <div class='table table-7 inputs'>

        <!-- date_then -->
        <input
          class='table-cell'
          id='input_date_then'
          type='text'
          name='input_date_then'
          placeholder='Date Purchased ( Then )'>

          <!-- input_symbol_pair -->
          <input
             class='table-cell'
             id='input_symbol_pair'
             type='text'
             name='input_symbol_pair'
             placeholder='Symbol Pair'
             required=''>

          <!-- input_price_crypto_then_share -->
          <input
             class='table-cell'
             id='input_price_crypto_then_share'
             type='number'
             name='input_price_crypto_then_share'
             placeholder='Price ( ETH or BTC )'>

         <!-- input_quantity -->
         <input
            class='table-cell'
            id='input_quantity'
            type='number'
            name='input_quantity'
            placeholder='Quantity'
            required=''>

          <!-- input_price_usd_then_share -->
          <input
             class='table-cell'
             id='input_price_usd_then_share'
             type='number'
             hidden='hidden'
             name='input_price_usd_then_share'
             placeholder='Price ( USD ) ( will be estimated if not provided )'>

          <!-- input_exchange -->
          <input
             class='table-cell'
             id='input_exchange'
             type='text'
             name='input_exchange'
             placeholder='Exchange'>

         <button
           id='writeToLocalStorage'
           onclick='writeToLocalStorage()'
           class='table-cell bg-g submit'
           style='text-align: center'>Save - writeToLocalStorage
         </button>

        </div>
        <!----------->
        <!-- end ---->
        <!-- input -->


        <!-- writeToLocalStorage -->
        <div class='table table--mobile header' style='margin-bottom: 50px'>
          <div id='writeToLocalStorage-notification'></div>
        </div>

        <div class='df jf-start color-white' style='margin-bottom: 9px'>export/clear</div>

        <div class="table table-2" style="height:6px; margin: 0">
          <div class="table-cell " style="border-top-left-radius: 4px;padding: 0;background: rgb(72, 72, 72);"></div>
          <div class="table-cell" style="border-top-right-radius: 4px;padding: 0;background: rgb(72, 72, 72);"></div>
        </div>

        <!-- exportJsonUrl and clearLocalStorage -->
        <div class='table table-3 table--mobile header'>

          <!-- exportJsonUrl -->
          <button
            id='exportJsonUrl'
            onclick='exportJsonUrl()'
            class='cursor-pointer table-cell'
            style='height: 34px;margin-right: 3px;'>exportJsonUrl ( auto-copied to your 'clipboard - send link to your phone' )
          </button>
          <!-- clearLocalStorage -->
          <button
            id='clearLocalStorage'
            onclick='clearLocalStorage()'
            class='cursor-pointer table-cell'
            style='height: 34px'>clearLocalStorage ( will ERASE everything )
          </button>
          <!-- dom_export_json_url -->
        </div>

        <div class='table table-1 table--mobile header'>

          <textarea
            id='dom_export_json_url'
            class='hide table-cell'
            style='margin-bottom: 10px'>
          </textarea>
        </div>
      </div>



      <!-- credit -->
      <div class='color-white mobile-hide'><span>built by <a href='http://mep.im'>hi@mep.im</a> - no data stored on server - <a href='https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage' target='_blank'>uses localStorage</a> - <a target='_blank' href='https://github.com/59023g/local-crypto-wallet'>code</a> ( 7kb )</span></div>

      <!--<div style='display:flex;order:11'>ETH: 0x3CB36CE808919799564F3A8B13d0FA1A980F6369 <br> BTC: 1FHkA7UAU2qyDtWmbTB1TgybyMvbpKej16 </div> -->


      <!-- local data for less round trips -->
      <script>

      window.btc_historical = ${ btc_historical  }
      window.eth_historical = ${ eth_historical  }

      window.binance_symbols = ["ETHBTC","LTCBTC","BNBBTC","NEOBTC","123456","QTUMETH","EOSETH","SNTETH","BNTETH","BCCBTC","GASBTC","BNBETH","BTCUSDT","ETHUSDT","HSRBTC","OAXETH","DNTETH","MCOETH","ICNETH","MCOBTC","WTCBTC","WTCETH","LRCBTC","LRCETH","QTUMBTC","YOYOBTC","OMGBTC","OMGETH","ZRXBTC","ZRXETH","STRATBTC","STRATETH","SNGLSBTC","SNGLSETH","BQXBTC","BQXETH","KNCBTC","KNCETH","FUNBTC","FUNETH","SNMBTC","SNMETH","NEOETH","IOTABTC","IOTAETH","LINKBTC","LINKETH","XVGBTC","XVGETH","CTRBTC","CTRETH","SALTBTC","SALTETH","MDABTC","MDAETH","MTLBTC","MTLETH","SUBBTC","SUBETH","EOSBTC","SNTBTC","ETCETH","ETCBTC","MTHBTC","MTHETH","ENGBTC","ENGETH","DNTBTC","ZECBTC","ZECETH","BNTBTC","ASTBTC","ASTETH","DASHBTC","DASHETH","OAXBTC","ICNBTC","BTGBTC","BTGETH","EVXBTC","EVXETH","REQBTC","REQETH","VIBBTC","VIBETH","HSRETH","TRXBTC","TRXETH","POWRBTC","POWRETH","ARKBTC","ARKETH","YOYOETH","XRPBTC","XRPETH","MODBTC","MODETH","ENJBTC","ENJETH","STORJBTC","STORJETH","BNBUSDT","VENBNB","YOYOBNB","POWRBNB","VENBTC","VENETH","KMDBTC","KMDETH","NULSBNB","RCNBTC","RCNETH","RCNBNB","NULSBTC","NULSETH","RDNBTC","RDNETH","RDNBNB","XMRBTC","XMRETH","DLTBNB","WTCBNB","DLTBTC","DLTETH","AMBBTC","AMBETH","AMBBNB","BCCETH","BCCUSDT","BCCBNB","BATBTC","BATETH","BATBNB","BCPTBTC","BCPTETH","BCPTBNB","ARNBTC","ARNETH","GVTBTC","GVTETH","CDTBTC","CDTETH","GXSBTC","GXSETH","NEOUSDT","NEOBNB","POEBTC","POEETH","QSPBTC","QSPETH","QSPBNB","BTSBTC","BTSETH","BTSBNB","XZCBTC","XZCETH","XZCBNB","LSKBTC","LSKETH","LSKBNB","TNTBTC","TNTETH","FUELBTC","FUELETH","MANABTC","MANAETH","BCDBTC","BCDETH","DGDBTC","DGDETH","IOTABNB","ADXBTC","ADXETH","ADXBNB","ADABTC","ADAETH","PPTBTC","PPTETH","CMTBTC","CMTETH","CMTBNB","XLMBTC","XLMETH","XLMBNB","CNDBTC","CNDETH","CNDBNB","LENDBTC","LENDETH","WABIBTC","WABIETH","WABIBNB","LTCETH","LTCUSDT","LTCBNB","TNBBTC","TNBETH","WAVESBTC","WAVESETH","WAVESBNB","GTOBTC","GTOETH","GTOBNB","ICXBTC","ICXETH","ICXBNB","OSTBTC","OSTETH","OSTBNB","ELFBTC","ELFETH","AIONBTC","AIONETH","AIONBNB","NEBLBTC","NEBLETH","NEBLBNB","BRDBTC","BRDETH","BRDBNB","MCOBNB","EDOBTC","EDOETH","WINGSBTC","WINGSETH","NAVBTC","NAVETH","NAVBNB","LUNBTC","LUNETH","TRIGBTC","TRIGETH","TRIGBNB","APPCBTC","APPCETH","APPCBNB"]
      </script>
    ` )
}
