### local-crypto-wallet
Rapidly built - localStorage, realtime pricing, crypto wallet - no data stored on the server 

<img src="https://github.com/59023g/local-crypto-wallet/blob/master/mobile.png" width=400px/>
<img src="https://github.com/59023g/local-crypto-wallet/blob/master/desktop.png" width=800px/>

[localcoinportfolio.com](https://localcoinportfolio.com)

I was tired of clicking through all my exchanges and doing the calculations to know the values of all my crypto assets. And I am not a fan of Excel, so...

All data you input is stored locally in your browser via localstorage. There's a websocket connection pushing down real-time market data every second.

Lastly, you're able to easily backup the data, or port it across devices, by generating a URL with your data as query params ( See exportJsonUrl() button ). For example:

[example with entries populated](https://localcoinportfolio.com/?json=%5B%7B%22id%22:0,%22input_date_then%22:1514937600000,%22input_symbol_pair%22:%22ZRXBTC%22,%22meta_quote_currency%22:%22ZRX%22,%22meta_base_currency%22:%22BTC%22,%22input_quantity%22:20100,%22input_price_crypto_then_share%22:0.00006471,%22meta_price_est_crypto_then_usd%22:15150,%22input_price_usd_then_share%22:0.9803565,%22meta_total_then_entry_crypto%22:1.300671,%22meta_total_then_entry_usd%22:19705.16565,%22input_exchange%22:%22Binance%22%7D,%7B%22id%22:1,%22input_date_then%22:1513036800000,%22input_symbol_pair%22:%22XRPBTC%22,%22meta_quote_currency%22:%22XRP%22,%22meta_base_currency%22:%22BTC%22,%22input_quantity%22:14500,%22input_price_crypto_then_share%22:0.00001771,%22meta_price_est_crypto_then_usd%22:16227.9999999,%22input_price_usd_then_share%22:0.287397879998229,%22meta_total_then_entry_crypto%22:0.256795,%22meta_total_then_entry_usd%22:4167.26925997432,%22input_exchange%22:%22Binance%22%7D,%7B%22id%22:2,%22input_date_then%22:1515108780000,%22input_symbol_pair%22:%22BATBTC%22,%22meta_quote_currency%22:%22BAT%22,%22meta_base_currency%22:%22BTC%22,%22input_quantity%22:34000,%22input_price_crypto_then_share%22:0.00005,%22meta_price_est_crypto_then_usd%22:15167.62803252,%22input_price_usd_then_share%22:0.7583814016260001,%22meta_total_then_entry_crypto%22:1.7000000000000002,%22meta_total_then_entry_usd%22:25784.967655284003,%22input_exchange%22:%22Poloniex%22%7D,%7B%22id%22:3,%22input_date_then%22:1488787200000,%22input_symbol_pair%22:%22BTCUSDT%22,%22meta_quote_currency%22:%22BTC%22,%22meta_base_currency%22:%22USDT%22,%22input_quantity%22:20,%22input_price_crypto_then_share%22:1,%22meta_price_est_crypto_then_usd%22:1274.3162846,%22input_price_usd_then_share%22:1274.3162846,%22meta_total_then_entry_crypto%22:20,%22meta_total_then_entry_usd%22:25486.325692,%22input_exchange%22:%22Gemini%22%7D%5D)
