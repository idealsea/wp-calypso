/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import CompactCard from 'components/card';
import EmptyContent from 'components/empty-content';
import Main from 'components/main';
import MeSidebarNavigation from 'me/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import PendingPurchase from './pending-purchase';
import PurchasesHeader from '../purchases/purchases-list/header';
import PurchasesSite from '../purchases/purchases-site';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getHttpData, requestHttpData } from 'state/data-layer/http-data';
import { http } from 'state/data-layer/wpcom-http/actions';

class PendingPurchases extends Component {
	componentDidMount = () => {
		requestPendingPurchases( this.props.userId );
	};

	render() {
		const { loaded, fetching, pending, translate } = this.props;

		let content;

		if ( fetching ) {
			content = <PurchasesSite isPlaceholder />;
		} else if ( loaded && ! pending.length ) {
			content = (
				<CompactCard className="pending-purchases__no-content">
					<EmptyContent
						title={ translate( 'Looking to upgrade?' ) }
						line={ translate(
							'Our plans give your site the power to thrive. ' + 'Find the plan that works for you.'
						) }
						action={ translate( 'Upgrade Now' ) }
						actionURL={ '/plans' }
						illustration={ '/calypso/images/illustrations/illustration-nosites.svg' }
					/>
				</CompactCard>
			);
		} else if ( loaded && pending.length ) {
			content = (
				<div>
					{ pending.map( purchase => (
						<PendingPurchase key={ purchase.siteId } purchase={ purchase } />
					) ) }
				</div>
			);
		}

		return (
			<Main className="pending-purchases">
				<PageViewTracker path="/me/purchases/pending" title="Pending Purchases" />
				<MeSidebarNavigation />
				<PurchasesHeader section="pending" />
				{ content }
			</Main>
		);
	}
}

PendingPurchases.propTypes = {
	userId: PropTypes.number.isRequired,
	pendingPurchases: PropTypes.array.isRequired,
	uninitialized: PropTypes.bool,
	pending: PropTypes.bool,
	sucess: PropTypes.bool,
	failure: PropTypes.bool,
	error: PropTypes.object,
};

// export const getPendingPurchase = ( state, siteId ) =>
// 	state.pendingPurchases.find( purchase => purchase.siteId === siteId );

export const requestId = userId => `pending-purchases/${ userId }`;

export const requestPendingPurchases = userId => {
	return requestHttpData(
		requestId( userId ),
		http( {
			path: '/me/purchases/pending',
			apiVersion: '1.1',
			method: 'POST',
			body: { userId },
		} ),
		{
			fromApi: () => purchases => [ [ requestId( userId ), purchases ] ],
			freshness: -Infinity,
		}
	);
};

export default connect( state => {
	const userId = getCurrentUserId( state );
	const response = getHttpData( requestId( userId ) );

	return {
		userId,
		pendingPurchases: response.data || [],
		[ response.state ]: true,
		error: response.error,
	};
} )( localize( PendingPurchases ) );
