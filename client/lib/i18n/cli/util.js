/**
 * Module dependencies/
 */
import fs from 'fs';

/**
 * Reads the inputFiles and concat all their content into one string.

 * @param  {string}   inputFiles  - location of the javascript file to parse
 * @param  {Function} done       - callback function
 */
function concatAllFiles( inputFiles ) {
	return inputFiles.map( function( inputFile ) {
		return fs.readFileSync( inputFile, 'utf8' );
	} ).join( '\n' );
}

export default {
	concatAllFiles: concatAllFiles
};
