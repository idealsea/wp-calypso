/** @format */

/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import {
	isDomainProduct,
	isDomainTransfer,
	isGoogleApps,
	isPlan,
	isTheme,
} from 'lib/products-values';
import PlanIcon from 'components/plans/plan-icon';
import Gridicon from 'gridicons';

export default function PurchaseIcon( { purchase, className } ) {
	if ( ! purchase ) {
		return null;
	}

	let icon;

	if ( isPlan( purchase ) ) {
		icon = <PlanIcon plan={ purchase.productSlug } />;
	} else if ( isDomainProduct( purchase ) || isDomainTransfer( purchase ) ) {
		icon = <Gridicon icon={ 'domains' } size={ 24 } />;
	} else if ( isTheme( purchase ) ) {
		icon = <Gridicon icon={ 'themes' } size={ 24 } />;
	} else if ( isGoogleApps( purchase ) ) {
		icon = <Gridicon icon={ 'mail' } size={ 24 } />;
	} else {
		return null;
	}

	return <div className={ classNames( 'purchase-icon', className ) }>{ icon }</div>;
}
