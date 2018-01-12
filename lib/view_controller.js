// view_controller.js

let views = {
  head_view: require( './views/head_view' ),
  foot_view: require( './views/foot_view' ),
  index_view: require( './views/index_view' )
}

const renderHtml = async ( template, data ) => {
  try {
    return (
      `

          ${ views[ 'head_view' ]() }
          ${ views[ template + '_view' ]( data ) }
          ${ views[ 'foot_view' ]() }

        `
    )
  } catch ( error ) {
    console.error( 'renderHtml(): ', error )
  }
}

module.exports = renderHtml
