
module.exports = ( ) => {
  return (
    `
    <html>
      <head>
        <meta charset="UTF-8">
        <link type='text/css' href='style.css' rel='stylesheet'>
        <script type='text/javascript' src='client.js' charset='utf-8'></script>
        <meta content="width=device-width,user-scalable=no" name="viewport">
        <meta name="google" content="notranslate">
        <meta http-equiv="Content-Language" content="en">
      </head>

    <body>

    <!-- header -->
    <div id='header'>

      <div class=' df jf-start color-white' style='margin-bottom: 9px; margin-top: 25px'>local-coin_portfolio-v1 <span style='opacity: .7; margin-left: 20px' class='mobile-hide'> no data stored on server</span></div>

      <div class='table table-2' style='height:6px'>
        <div class='table-cell bg-aqua ' style='border-top-left-radius: 4px;'></div>
        <div class='table-cell bg-coral' style='border-top-right-radius: 4px;'></div>
      </div>
    </div>

    `

  )
}
