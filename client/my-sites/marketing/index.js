/** @format */

/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, redirectLoggedOut } from 'controller';
import { navigation, sites, siteSelection } from 'my-sites/controller';
import { seo } from './controller';
import { getSelectedSiteId } from '../../state/ui/selectors';
import isGoogleMyBusinessLocationConnected from '../../state/selectors/is-google-my-business-location-connected';
import getGoogleMyBusinessLocations from '../../state/selectors/get-google-my-business-locations';
import { getSiteKeyringsForService } from '../../state/site-keyrings/selectors';
import { selectLocation } from '../google-my-business/controller';

export default function( router ) {
	router(
		'/marketing',
		redirectLoggedOut,
		siteSelection,
		sites,
		makeLayout
	);

	router(
		'/marketing/:site',
		redirectLoggedOut,
		siteSelection,
		context => {
			page.redirect( `/marketing/seo/${ context.params.site }` );
		}
	);

	router(
		'/marketing/seo',
		redirectLoggedOut,
		siteSelection,
		sites,
		makeLayout
	);

	router(
		'/marketing/seo/:site',
		redirectLoggedOut,
		siteSelection,
		seo,
		navigation,
		makeLayout
	);
}
