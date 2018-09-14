/** @format */

/**
 * Internal Dependencies
 */
import { createReducer } from 'state/utils';
import {
	PENDING_PURCHASE_REMOVE,
	PENDING_PURCHASE_REMOVE_COMPLETED,
	PENDING_PURCHASE_REMOVE_FAILED,
	PENDING_PURCHASES_FETCH,
	PENDING_PURCHASES_FETCH_COMPLETED,
	PENDING_PURCHASES_FETCH_FAILED,
} from 'state/action-types';

export default createReducer(
	{
		list: [],
		error: null,
		fetching: false,
		loaded: false,
	},
	{
		[ PENDING_PURCHASES_FETCH ]: state => ( { ...state, isFetching: true } ),

		[ PENDING_PURCHASES_FETCH_COMPLETED ]: ( state, action ) => ( {
			...state,
			list: action.purchases,
			error: null,
			fetching: false,
			loaded: true,
		} ),

		[ PENDING_PURCHASES_FETCH_FAILED ]: ( state, action ) => ( {
			...state,
			error: action.error,
			fetching: false,
			loaded: true,
		} ),

		[ PENDING_PURCHASE_REMOVE ]: ( state, action ) => ( {
			...state,
			list: state.list.map( purchase => {
				if ( purchase.siteId === action.siteId ) {
					purchase.removing = true;
				}

				return purchase;
			} ),
		} ),

		[ PENDING_PURCHASE_REMOVE_COMPLETED ]: ( state, action ) => ( {
			...state,
			list: state.list.filter( purchase => purchase.siteId !== action.siteId ), // filter out removed
			error: null,
		} ),

		[ PENDING_PURCHASE_REMOVE_FAILED ]: ( state, action ) => ( {
			...state,
			error: action.error,
		} ),
	}
);
