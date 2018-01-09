// view_controller.js

const fs = require( 'fs' )
const path = require( 'path' )

// https://stackoverflow.com/questions/41117799/string-interpolation-on-variable
const template = ( tpl, args ) => tpl.replace( /\${((\s\w+\s)|(\w+))}/g, ( _, v ) => args[ v ] );

const convertHtmltoJS = async ( filePath, data ) => {

  let file
  try {
    file = await fs.readFileSync( filePath ).toString()
    return template( file, data )
  } catch ( error ) {
    console.log( 'error', error )
  }

}

const renderHtml = async ( filePath, data ) => {

  try {
    const relativePath = path.join( __dirname ) + '/'

    return await convertHtmltoJS( `${relativePath}${ filePath }.html`, data )

  } catch ( error ) {
    console.log( 'errorrr', error )
  }
}

module.exports = renderHtml
