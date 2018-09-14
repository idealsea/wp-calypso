/** @format */

/**
 * Returns a site's pending purchase
 * @param  {Object} state global state
 * @param  {Number} siteId the site id
 * @return {Object} the matching purchases if there are some
 */
export const getPendingPurchase = ( state, siteId ) =>
	state.pendingPurchases.find( purchase => purchase.siteId === siteId );
