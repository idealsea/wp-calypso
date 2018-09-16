/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import SectionNav from 'components/section-nav';
import Checklist from 'components/checklist';
import Task from 'components/checklist/task';

class MarketingSeo extends Component {
	state = {};

	markAsDone = taskId => () => {
		this.setState( state => ( { [ taskId ]: !state[ taskId ] } ) );
	};

	render() {
		const { siteSlug, translate } = this.props;

		return (
			<Main className="gmb-new-account" wideLayout>
				<DocumentHead title={ translate( 'Marketing' ) } />

				<SectionNav
					selectedText={ 'seo' }
				>
					<NavTabs label="Section" selectedText={ 'seo' }>
						<NavItem
							path={ `/marketing/seo/${ siteSlug }` }
							selected
						>
							{ translate( 'Seo' ) }
						</NavItem>

						<NavItem
							path={ `/marketing/newsletter/${ siteSlug }` }
						>
							{ translate( 'Newsletter' ) }
						</NavItem>

					</NavTabs>
				</SectionNav>

				<Checklist>
					<Task
						onClick={ this.markAsDone( 'task1' ) }
						onDismiss={ this.markAsDone( 'task1' ) }
						title="Connect to Google Search Console"
						buttonText="Connect"
						buttonPrimary
						completedTitle="You are connected to Google Search Console"
						description="Enable this free tool to monitor and maintain your site's presence in Google Search results"
						duration="1 minute"
						completed={ this.state.task1 }
					/>

					<Task
						onClick={ this.markAsDone( 'task2' ) }
						onDismiss={ this.markAsDone( 'task2' ) }
						title="Add your site to Google Search Console"
						buttonText="Add"
						buttonPrimary
						completedTitle="You have added your site to Google Search Console"
						description="Set up Google Search Console to manage your site"
						duration="1 minute"
						completed={ this.state.task2 }
					/>

					<Task
						onClick={ this.markAsDone( 'task3' ) }
						onDismiss={ this.markAsDone( 'task3' ) }
						title="Submit your site's sitemap"
						buttonText="Submit"
						buttonPrimary
						completedTitle="You have submitted your site's sitemap to Google Search"
						description="Help Google Search discover content on your site by submitting a sitemap"
						duration="instantaneous"
						completed={ this.state.task3 }
					/>

					<Task
						onClick={ this.markAsDone( 'task4' ) }
						onDismiss={ this.markAsDone( 'task4' ) }
						title="Turn on automatic indexing"
						buttonText="Enable"
						buttonPrimary
						completedTitle="You have enabled automatic indexing of your site's content in Google Search"
						description="Notify Google Search when you add new content in order to appear faster in search results"
						duration="instantaneous"
						completed={ this.state.task4 }
					/>

					<Task
						onClick={ this.markAsDone( 'task5' ) }
						onDismiss={ this.markAsDone( 'task5' ) }
						title="Connect to Google My Business"
						buttonText="Connect"
						buttonPrimary
						completedTitle="You are managing your business listing on Google My Business"
						description="Enable this free tool to manage your business listing on Google Search and Maps"
						duration="5 minutes"
						completed={ this.state.task5 }
					/>

					<Task
						onClick={ this.markAsDone( 'task6' ) }
						onDismiss={ this.markAsDone( 'task6' ) }
						title="Add a meta description"
						buttonText="Add"
						buttonPrimary
						completedTitle="You have added a meta description of your site"
						description="Add a compelling description of your site that will appear in search engine results"
						duration="5 minutes"
						completed={ this.state.task6 }
					/>
				</Checklist>
			</Main>
		);
	}
}

export default connect(
	state => ( {
		siteSlug: getSelectedSiteSlug( state ),
	} ),
)( localize( MarketingSeo ) );
