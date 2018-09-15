/** @format */

/**
 * External dependencies
 */
import moment from 'moment';
import { difference, omitBy, isNull, merge, memoize } from 'lodash';

/**
 * Internal dependencies
 */
import { rangeOfPeriod } from 'state/stats/lists/utils';

export const QUERY_FIELDS = [ 'views', 'visitors', 'likes', 'comments', 'post_titles' ];

export function getQueryDate( queryDate, timezoneOffset, period, quantity ) {
	const momentSiteZone = moment().utcOffset( timezoneOffset );
	const endOfPeriodDate = rangeOfPeriod( period, momentSiteZone.locale( 'en' ) ).endOf;
	const periodDifference = moment( endOfPeriodDate ).diff( moment( queryDate ), period );
	if ( periodDifference >= quantity ) {
		return moment( endOfPeriodDate )
			.subtract( Math.floor( periodDifference / quantity ) * quantity, period )
			.format( 'YYYY-MM-DD' );
	}
	return endOfPeriodDate;
}

export function generateQueries( period, date, quantity, chartTab ) {
	// If we are on the default Tab, grab visitors too
	const queryFields = 'views' === chartTab ? 'views,visitors' : chartTab;
	const supplementalQueryFields = difference( QUERY_FIELDS, queryFields.split( ',' ) ).join( ',' );
	const baseQuery = { unit: period, date, quantity };
	return {
		query: { ...baseQuery, stat_fields: queryFields },
		supplementalQuery: { ...baseQuery, stat_fields: supplementalQueryFields },
	};
}

export const mergeQueryResults = memoize( ( [ resultsA, resultsB ], id = 'period' ) => {
	const results = new Map( resultsA.map( result => [ result[ id ], result ] ) );
	resultsB.forEach( result => {
		const nextResult = results.has( result[ id ] )
			? merge( results.get( result[ id ] ), omitBy( result, isNull ) )
			: result;
		results.set( result[ id ], nextResult );
	} );
	return [ ...results.values() ];
} );

export function formatDate( date, period ) {
	const momentizedDate = moment( date );
	switch ( period ) {
		case 'day':
			return momentizedDate.format( 'LL' );
		case 'week':
			return momentizedDate.format( 'L' ) + ' - ' + momentizedDate.add( 6, 'days' ).format( 'L' );
		case 'month':
			return momentizedDate.format( 'MMMM YYYY' );
		case 'year':
			return momentizedDate.format( 'YYYY' );
		default:
			return null;
	}
}
