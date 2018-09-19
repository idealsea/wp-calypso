/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import {
	getName,
	isExpired,
	isExpiring,
	isIncludedWithPlan,
	isOneTimePurchase,
	isRenewing,
	purchaseType,
	showCreditCardExpiringWarning,
	subscribedWithinPastWeek,
} from 'lib/purchases';
import {
	isDomainProduct,
	isDomainTransfer,
	isGoogleApps,
	isPlan,
	isTheme,
} from 'lib/products-values';
import Notice from 'components/notice';
import PurchaseIcon from 'components/purchase-icon';
import Gridicon from 'gridicons';
import { managePurchase } from '../paths';

class PendingItem extends Component {
	placeholder() {
		return (
			<span className="pending-purchases__item-wrapper">
				<div className="pending-purchases__item-plan-icon" />
				<div className="pending-purchases__item-details">
					<div className="pending-purchases__item-title" />
					<div className="pending-purchases__item-purchase-type" />
					<div className="pending-purchases__item-purchase-date" />
				</div>
			</span>
		);
	}

	render() {
		const { isPlaceholder, isDisconnectedSite, purchase, isJetpack } = this.props;
		const classes = classNames( 'pending-purchase', { 'is-placeholder': isPlaceholder } );

		let content;
		if ( isPlaceholder ) {
			content = this.placeholder();
		} else {
			content = (
				<span className="pending-purchases__item-wrapper">
					<PurchaseIcon purchase={ purchase } />
					<div className="pending-purchases__item-details">
						<div className="pending-purchases__item-title">{ getName( purchase ) }</div>
						<div className="pending-purchases__item-purchase-type">
							{ purchaseType( purchase ) }
						</div>
						<div className="pending-purchases__item-purchase-date">{ paymentType( purchase ) }</div>
					</div>
				</span>
			);
		}

		let onClick;
		let href;
		if ( ! isPlaceholder ) {
			// A "disconnected" Jetpack site's purchases may be managed.
			// A "disconnected" WordPress.com site may not (the user has been removed).
			if ( ! isDisconnectedSite || isJetpack ) {
				onClick = () => window.scrollTo( 0, 0 );
				href = managePurchase( this.props.slug, this.props.purchase.id );
			}
		}

		return (
			<CompactCard
				className={ classes }
				data-e2e-connected-site={ ! isDisconnectedSite }
				href={ href }
				onClick={ onClick }
			>
				{ content }
			</CompactCard>
		);
	}
}

PendingItem.propTypes = {
	isPlaceholder: PropTypes.bool,
	purchase: PropTypes.object,
	slug: PropTypes.string,
	isJetpack: PropTypes.bool,
};

export default localize( PendingItem );
