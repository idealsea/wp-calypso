/** @format */
/**
 * External dependencies
 */
import page from 'page';
import React from 'react';
import i18n from 'i18n-calypso';
import { get, noop, some, startsWith, uniq } from 'lodash';

/**
 * Internal Dependencies
 */
import { SITES_ONCE_CHANGED } from 'state/action-types';
import userFactory from 'lib/user';
import { receiveSite, requestSite } from 'state/sites/actions';
import {
	getSite,
	getSiteAdminUrl,
	isJetpackModuleActive,
	isJetpackSite,
	isRequestingSites,
	isRequestingSite,
	hasAllSitesList,
} from 'state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { setSelectedSiteId, setSection, setAllSitesSelected } from 'state/ui/actions';
import { savePreference } from 'state/preferences/actions';
import { hasReceivedRemotePreferences, getPreference } from 'state/preferences/selectors';
import NavigationComponent from 'my-sites/navigation';
import { getSiteFragment, sectionify } from 'lib/route';
import notices from 'notices';
import config from 'config';
import analytics from 'lib/analytics';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import getPrimaryDomainBySiteId from 'state/selectors/get-primary-domain-by-site-id';
import getPrimarySiteSlug from 'state/selectors/get-primary-site-slug';
import getSiteId from 'state/selectors/get-site-id';
import getSites from 'state/selectors/get-sites';
import isDomainOnlySite from 'state/selectors/is-domain-only-site';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import canCurrentUser from 'state/selectors/can-current-user';
import {
	domainManagementAddGoogleApps,
	domainManagementContactsPrivacy,
	domainManagementDns,
	domainManagementEdit,
	domainManagementEditContactInfo,
	domainManagementEmail,
	domainManagementEmailForwarding,
	domainManagementList,
	domainManagementNameServers,
	domainManagementPrivacyProtection,
	domainManagementRedirectSettings,
	domainManagementTransfer,
	domainManagementTransferOut,
	domainManagementTransferToOtherSite,
} from 'my-sites/domains/paths';
import SitesComponent from 'my-sites/sites';
import { warningNotice } from 'state/notices/actions';
import { makeLayout, render as clientRender } from 'controller';
import NoSitesMessage from 'components/empty-content/no-sites-message';
import EmptyContentComponent from 'components/empty-content';
import DomainOnly from 'my-sites/domains/domain-management/list/domain-only';

/*
 * @FIXME Shorthand, but I might get rid of this.
 */
const getStore = context => ( {
	getState: () => context.store.getState(),
	dispatch: action => context.store.dispatch( action ),
} );

/**
 * Module vars
 */
const user = userFactory();
const sitesPageTitleForAnalytics = 'Sites';

/*
 * The main navigation of My Sites consists of a component with
 * the site selector list and the sidebar section items
 * @param { object } context - Middleware context
 * @returns { object } React element containing the site selector and sidebar
 */
function createNavigation( context ) {
	const siteFragment = getSiteFragment( context.pathname );
	let basePath = context.pathname;

	if ( siteFragment ) {
		basePath = sectionify( context.pathname );
	}

	return (
		<NavigationComponent
			path={ context.path }
			allSitesPath={ basePath }
			siteBasePath={ basePath }
			user={ user }
		/>
	);
}

function removeSidebar( context ) {
	context.store.dispatch(
		setSection( {
			group: 'sites',
			secondary: false,
		} )
	);
}

function renderEmptySites( context ) {
	removeSidebar( context );

	context.primary = React.createElement( NoSitesMessage );

	makeLayout( context, noop );
	clientRender( context );
}

function renderNoVisibleSites( context ) {
	const currentUser = user.get();
	const hiddenSites = currentUser.site_count - currentUser.visible_site_count;
	const signup_url = config( 'signup_url' );

	removeSidebar( context );

	context.primary = React.createElement( EmptyContentComponent, {
		title: i18n.translate(
			'You have %(hidden)d hidden WordPress site.',
			'You have %(hidden)d hidden WordPress sites.',
			{
				count: hiddenSites,
				args: { hidden: hiddenSites },
			}
		),

		line: i18n.translate(
			'To manage it here, set it to visible.',
			'To manage them here, set them to visible.',
			{
				count: hiddenSites,
			}
		),

		action: i18n.translate( 'Change Visibility' ),
		actionURL: '//dashboard.wordpress.com/wp-admin/index.php?page=my-blogs',
		secondaryAction: i18n.translate( 'Create New Site' ),
		secondaryActionURL: `${ signup_url }?ref=calypso-nosites`,
	} );

	makeLayout( context, noop );
	clientRender( context );
}

function renderSelectedSiteIsDomainOnly( reactContext, selectedSite ) {
	reactContext.primary = <DomainOnly siteId={ selectedSite.ID } hasNotice={ false } />;

	reactContext.secondary = createNavigation( reactContext );

	makeLayout( reactContext, noop );
	clientRender( reactContext );
}

function isPathAllowedForDomainOnlySite( path, slug, primaryDomain ) {
	const allPaths = [
		domainManagementAddGoogleApps,
		domainManagementContactsPrivacy,
		domainManagementDns,
		domainManagementEdit,
		domainManagementEditContactInfo,
		domainManagementEmail,
		domainManagementEmailForwarding,
		domainManagementList,
		domainManagementNameServers,
		domainManagementPrivacyProtection,
		domainManagementRedirectSettings,
		domainManagementTransfer,
		domainManagementTransferOut,
		domainManagementTransferToOtherSite,
	];

	let domainManagementPaths = allPaths.map( pathFactory => pathFactory( slug, slug ) );

	if ( primaryDomain && slug !== primaryDomain.name ) {
		domainManagementPaths = domainManagementPaths.concat(
			allPaths.map( pathFactory => pathFactory( slug, primaryDomain.name ) )
		);
	}

	const startsWithPaths = [ '/checkout/', `/me/purchases/${ slug }` ];

	if ( some( startsWithPaths, startsWithPath => startsWith( path, startsWithPath ) ) ) {
		return true;
	}

	return domainManagementPaths.indexOf( path ) > -1;
}

function onSelectedSiteAvailable( context ) {
	const { getState } = getStore( context );
	const state = getState();
	const selectedSite = getSelectedSite( state );

	// Currently, sites are only made available in Redux state by the receive
	// here (i.e. only selected sites). If a site is already known in state,
	// avoid receiving since we risk overriding changes made more recently.
	// Also, if we can't manage the site, don't add it to state.
	if ( ! getSite( state, selectedSite.ID ) && selectedSite.capabilities ) {
		context.store.dispatch( receiveSite( selectedSite ) );
	}

	context.store.dispatch( setSelectedSiteId( selectedSite.ID ) );

	const primaryDomain = getPrimaryDomainBySiteId( getState(), selectedSite.ID );

	if (
		isDomainOnlySite( state, selectedSite.ID ) &&
		! isPathAllowedForDomainOnlySite( context.pathname, selectedSite.slug, primaryDomain )
	) {
		renderSelectedSiteIsDomainOnly( context, selectedSite );
		return false;
	}

	// Update recent sites preference
	if ( hasReceivedRemotePreferences( state ) ) {
		const recentSites = getPreference( state, 'recentSites' );
		if ( selectedSite.ID !== recentSites[ 0 ] ) {
			//also filter recent sites if not available locally
			const updatedRecentSites = uniq( [ selectedSite.ID, ...recentSites ] )
				.slice( 0, 5 )
				.filter( recentId => !! getSite( state, recentId ) );
			context.store.dispatch( savePreference( 'recentSites', updatedRecentSites ) );
		}
	}

	return true;
}

/**
 * Returns the site-picker react element.
 *
 * @param {object} context -- Middleware context
 * @returns {object} A site-picker React element
 */
function createSitesComponent( context ) {
	const contextPath = sectionify( context.path );

	// This path sets the URL to be visited once a site is selected
	const basePath = contextPath === '/sites' ? '/stats' : contextPath;

	analytics.pageView.record( contextPath, sitesPageTitleForAnalytics );

	return (
		<SitesComponent
			siteBasePath={ basePath }
			getSiteSelectionHeaderText={ context.getSiteSelectionHeaderText }
		/>
	);
}

function showMissingPrimaryError( currentUser, dispatch ) {
	const { username, primary_blog, primary_blog_url, primary_blog_is_jetpack } = currentUser;
	const tracksPayload = {
		username,
		primary_blog,
		primary_blog_url,
		primary_blog_is_jetpack,
	};

	if ( currentUser.primary_blog_is_jetpack ) {
		dispatch(
			warningNotice( i18n.translate( "Please check your Primary Site's Jetpack connection" ), {
				button: 'wp-admin',
				href: `${ currentUser.primary_blog_url }/wp-admin`,
			} )
		);
		analytics.tracks.recordEvent(
			'calypso_mysites_single_site_jetpack_connection_error',
			tracksPayload
		);
	} else {
		analytics.tracks.recordEvent( 'calypso_mysites_single_site_error', tracksPayload );
	}
}

// Clears selected site from global redux state
export function noSite( context, next ) {
	context.store.dispatch( setSelectedSiteId( null ) );
	return next();
}

/*
 * Set up site selection based on last URL param and/or handle no-sites error cases
 */
export function siteSelection( context, next ) {
	const { getState, dispatch } = getStore( context );
	const siteFragment = context.params.site || getSiteFragment( context.path );
	const basePath = sectionify( context.path, siteFragment );
	const currentUser = user.get();
	const hasOneSite = currentUser.visible_site_count === 1;
	const allSitesPath = sectionify( context.path, siteFragment );

	if ( currentUser && currentUser.site_count === 0 ) {
		renderEmptySites( context );
		return analytics.pageView.record( '/no-sites', sitesPageTitleForAnalytics + ' > No Sites', {
			base_path: basePath,
		} );
	}

	if ( currentUser && currentUser.visible_site_count === 0 ) {
		renderNoVisibleSites( context );
		return analytics.pageView.record(
			'/no-sites',
			`${ sitesPageTitleForAnalytics } > All Sites Hidden`,
			{ base_path: basePath }
		);
	}

	// Ignore the user account settings page
	if ( /^\/settings\/account/.test( context.path ) ) {
		return next();
	}

	/**
	 * If the user has only one site, redirect to the single site
	 * context instead of rendering the all-site views.
	 *
	 * If the /me/sites API endpoint hasn't returned yet, postpone the redirect until
	 * after the sites data are available by scheduling a `SITES_ONCE_CHANGED` callback.
	 */
	if ( hasOneSite && ! siteFragment ) {
		const redirectToPrimary = () => {
			const primarySiteSlug = getPrimarySiteSlug( getState() );
			let redirectPath = `${ context.pathname }/${ primarySiteSlug }`;

			redirectPath = context.querystring
				? `${ redirectPath }?${ context.querystring }`
				: redirectPath;

			page.redirect( redirectPath );
		};

		const hasInitialized = getSites( getState() ).length;
		if ( hasInitialized ) {
			if ( getPrimarySiteSlug( getState() ) ) {
				redirectToPrimary();
			} else {
				// If the primary site does not exist, skip redirect
				// and display a useful error notification
				showMissingPrimaryError( currentUser, dispatch );
			}
		} else {
			dispatch( {
				type: SITES_ONCE_CHANGED,
				listener: redirectToPrimary,
			} );
		}

		return;
	}

	// If the path fragment does not resemble a site, set all sites to visible
	if ( ! siteFragment ) {
		dispatch( setAllSitesSelected() );
		return next();
	}

	const siteId = getSiteId( getState(), siteFragment );
	if ( siteId ) {
		const state = getState();
		const isAtomicSite = isSiteAutomatedTransfer( state, siteId );
		const userCanManagePlugins = canCurrentUser( state, siteId, 'manage_options' );
		const calypsoify = isAtomicSite && config.isEnabled( 'calypsoify/plugins' );

		if (
			window &&
			window.location &&
			window.location.replace &&
			userCanManagePlugins &&
			calypsoify &&
			/^\/plugins/.test( basePath )
		) {
			const plugin = get( context, 'params.plugin' );
			let pluginString = '';
			if ( plugin ) {
				pluginString = [
					'tab=search',
					`s=${ plugin }`,
					'type=term',
					'modal-mode=true',
					`plugin=${ plugin }`,
				].join( '&' );
			}

			const pluginIstallURL = 'plugin-install.php?calypsoify=1' + `&${ pluginString }`;
			const pluginLink = getSiteAdminUrl( state, siteId ) + pluginIstallURL;

			return window.location.replace( pluginLink );
		}

		dispatch( setSelectedSiteId( siteId ) );
		const selectionComplete = onSelectedSiteAvailable( context );

		// if there was a redirect, we should terminate processing of next routes
		// and let the redirect proceed
		if ( ! selectionComplete ) {
			return;
		}
	} else {
		const selectOnSitesChange = () => {
			const freshSiteId = getSiteId( getState(), siteFragment );

			if ( getSite( getState(), freshSiteId ) ) {
				dispatch( setSelectedSiteId( freshSiteId ) );
				onSelectedSiteAvailable( context );
			} else if ( hasAllSitesList( getState() ) ) {
				// If all sites have loaded, but siteId is still invalid, redirect to allSitesPath.
				page.redirect( allSitesPath );
			}
		};

		// Fetch the site from siteFragment.
		dispatch( requestSite( siteFragment ) ).then( selectOnSitesChange );

		// if sites has fresh data and siteId is invalid
		// redirect to allSitesPath
		if ( ! isRequestingSites( getState() ) && ! isRequestingSite( getState(), siteFragment ) ) {
			return page.redirect( allSitesPath );
		}

		// Otherwise, check when sites has loaded
		dispatch( {
			type: SITES_ONCE_CHANGED,
			listener: selectOnSitesChange,
		} );
	}
	next();
}

export function jetpackModuleActive( moduleId, redirect ) {
	return function( context, next ) {
		const { getState } = getStore( context );
		const siteId = getSelectedSiteId( getState() );
		const isJetpack = isJetpackSite( getState(), siteId );
		const isModuleActive = isJetpackModuleActive( getState(), siteId, moduleId );

		if ( ! isJetpack ) {
			return next();
		}

		if ( isModuleActive || false === redirect ) {
			next();
		} else {
			page.redirect( 'string' === typeof redirect ? redirect : '/stats' );
		}
	};
}

export function navigation( context, next ) {
	// Render the My Sites navigation in #secondary
	context.secondary = createNavigation( context );
	next();
}

/**
 * Middleware that adds the site selector screen to the layout.
 *
 * @param {object} context -- Middleware context
 * @param {function} next -- Call next middleware in chain
 */
export function sites( context, next ) {
	if ( context.query.verified === '1' ) {
		notices.success(
			i18n.translate(
				"Email verified! Now that you've confirmed your email address you can publish posts on your blog."
			)
		);
	}

	context.store.dispatch( setLayoutFocus( 'content' ) );
	context.store.dispatch(
		setSection( {
			group: 'sites',
			secondary: false,
		} )
	);

	context.primary = createSitesComponent( context );
	next();
}
