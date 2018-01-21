// gulpfile
// http://clubmate.fi/how-to-zip-and-unzip-files-and-folders-on-your-remote-server/
require( 'dotenv' ).config()

const gulp = require( 'gulp' )
const concat = require( 'gulp-concat' )

const exec = require( 'child_process' ).exec
const fs = require( 'fs' )
const path = require( 'path' )


// Command line call wrapped in a promise
function pexec( command ) {
  return new Promise( ( resolve, reject ) => {
    exec( command, ( err, stdout, stderr ) => {
      if ( err ) {
        reject( err )
      }
      console.log( stdout );
      console.log( stderr );
      resolve( stdout );
    } )
  } )
}

// initiate remote environment, install node, setup certbot, and nginx
const initiateRemote = async () => {


}

// if build or zip folder, remove
const clean = async () => {
  if ( fs.existsSync( './zip' ) ) pexec( 'rm -rf ./zip' )
  if ( fs.existsSync( './build' ) ) return pexec( 'rm -rf ./build && mkdir ./build' )
  return fs.mkdirSync( './build' )
}

// compile app put in build folder, zip
const compileProdServer = async () => {
  return pexec( 'node_modules/.bin/browserify --entry lib/index.js --node --exclude utf-8-validate --exclude bufferutil --exclude forever > build/bundle.js && cp package.json build/' )
}

const compileClient = async () => {
  return pexec( 'mkdir build/public && node_modules/.bin/uglifyjs lib/public/client.js > build/public/client.js && cp lib/public/style.css build/public' )
}

// zip build folder
const zipDir = async () => {
  // get latest commit
  console.log( process.env.HOST)
  let commit = await pexec( 'git rev-parse HEAD' )
  return pexec( `mkdir zip && zip -r zip/${ commit.slice(0, 7) }.zip build `)
}

// push app to remote, unzip and deploy
const pushRemote = async() => {

return pexec( 'scp -p 3022 root@localhost:./zip')

}




gulp.task( 'initiateRemote', initiateRemote )
gulp.task( 'default', gulp.series( clean, gulp.parallel( [ compileProdServer, compileClient ] ), zipDir ) )
