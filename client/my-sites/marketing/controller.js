/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import MarketingSeo from './seo';

export function seo( context, next ) {
	context.primary = <MarketingSeo />;

	next();
}
