/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryBillingTransaction from 'components/data/query-billing-transaction';
import { recordGoogleEvent } from 'state/analytics/actions';

class PendingPurchase extends React.Component {
	renderPurchase( purchase ) {}

	renderPlaceholder() {}

	render() {
		const { siteName, orderId, purchase, translate } = this.props;

		return (
			<Main>
				<DocumentHead title={ translate( 'Billing History' ) } />
				<PageViewTracker
					path="/me/purchases/pending/:siteName/:orderId"
					title="Me > Pending Purchases > Pending Purchase"
				/>
				<QueryBillingTransaction orderId={ orderId } />
				{ this.renderTitle() }
				{ purchase ? this.renderPurchase( purchase ) : this.renderPlaceholder() }
			</Main>
		);
	}
}

export default connect(
	( state, { orderId } ) => ( {
		purchase: {}, // getPastBillingTransaction( state, transactionId ),
		purchaseFetchError: null, //isPastBillingTransactionError( state, transactionId ),
	} ),
	{
		recordGoogleEvent,
	}
)( localize( PendingPurchase ) );
