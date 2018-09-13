/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PendingPurchasesComponent from './index';
import PendingPurchase from './pending-purchase';

export function pendingPurchases( context, next ) {
	context.primary = React.createElement( PendingPurchasesComponent );
	next();
}

export function pendingPurchase( context, next ) {
	const site = context.params.site;
	const orderId = context.params.orderId;

	if ( site && orderId ) {
		context.primary = React.createElement( PendingPurchase, { site, orderId } );
	}
	next();
}
