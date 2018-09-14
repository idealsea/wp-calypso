/** @format */

/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	PENDING_PURCHASE_REMOVE,
	PENDING_PURCHASE_REMOVE_COMPLETED,
	PENDING_PURCHASE_REMOVE_FAILED,
	PENDING_PURCHASES_FETCH,
	PENDING_PURCHASES_FETCH_COMPLETED,
	PENDING_PURCHASES_FETCH_FAILED,
} from 'state/action-types';

import wp from 'lib/wp';
const wpcom = wp.undocumented();

const FETCH_ERROR_MESSAGE = i18n.translate( 'There was an error retrieving purchases.' );
const REMOVE_ERROR_MESSAGE = i18n.translate( 'There was an error removing the purchase.' );

export const fetchPendingPurchases = userId => dispatch => {
	dispatch( {
		type: PENDING_PURCHASES_FETCH,
	} );

	return new Promise( ( resolve, reject ) => {
		wpcom.me().pendingPurchases( ( error, data ) => {
			error ? reject( error ) : resolve( data );
		} );
	} )
		.then( data => {
			dispatch( {
				type: PENDING_PURCHASES_FETCH_COMPLETED,
				purchases: data,
				userId,
			} );
		} )
		.catch( () => {
			dispatch( {
				type: PENDING_PURCHASES_FETCH_FAILED,
				error: FETCH_ERROR_MESSAGE,
			} );
		} );
};

export const removePendingPurchase = siteId => dispatch => {
	dispatch( {
		type: PENDING_PURCHASE_REMOVE,
		siteId,
	} );

	return new Promise( ( resolve, reject ) => {
		wpcom.me().deletePendingPurchase( siteId, ( error, data ) => {
			error ? reject( error ) : resolve( data );
		} );
	} )
		.then( data => {
			dispatch( {
				type: PENDING_PURCHASE_REMOVE_COMPLETED,
				purchases: data.purchases,
				siteId,
			} );
		} )
		.catch( error => {
			dispatch( {
				type: PENDING_PURCHASE_REMOVE_FAILED,
				error: error.message || REMOVE_ERROR_MESSAGE,
			} );
		} );
};
