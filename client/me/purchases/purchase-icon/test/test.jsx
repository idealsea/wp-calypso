/** @format */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import {
	PLAN_FREE,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
} from 'lib/plans/constants';
import { domainProductSlugs } from 'lib/domains/constants';
import PurchaseIcon from '../index';
import PlanIcon from 'components/plans/plan-icon';
import Gridicon from 'gridicons';

describe( 'PurchaseIcon basic tests', () => {
	test( 'CSS', () => {
		const purchase = {
			productId: 1,
			productSlug: PLAN_BUSINESS,
			productName: 'Ignored',
			is_domain_registration: false,
		};
		const wrapper = shallow( <PurchaseIcon purchase={ purchase } className="arbitrary" /> );
		expect( wrapper.find( '.purchase-icon' ) ).toHaveLength( 1 );
		expect( wrapper.find( '.arbitrary' ) ).toHaveLength( 1 );
		expect( wrapper.contains( <PlanIcon plan={ purchase.productSlug } /> ) );
	} );

	[
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_PREMIUM,
		PLAN_PREMIUM_2_YEARS,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
	].forEach( plan => {
		test( `PlanIcon for plan: ${ plan }`, () => {
			const purchase = {
				productId: 1,
				productSlug: plan,
				productName: 'Ignored',
				is_domain_registration: false,
			};
			const wrapper = shallow( <PurchaseIcon purchase={ purchase } /> );
			expect( wrapper.find( '.purchase-icon' ) ).toHaveLength( 1 );
			expect( wrapper.contains( <PlanIcon plan={ purchase.productSlug } /> ) );
		} );
	} );

	[ PLAN_FREE, PLAN_JETPACK_FREE ].forEach( plan => {
		test( `No PlanIcon for plan: ${ plan }`, () => {
			const purchase = {
				productId: 1,
				productSlug: plan,
				productName: 'Ignored',
				is_domain_registration: false,
			};
			const wrapper = shallow( <PurchaseIcon purchase={ purchase } /> );
			expect( wrapper.find( '.purchase-icon' ) ).toHaveLength( 0 );
			expect( wrapper.contains( <PlanIcon plan={ purchase.productSlug } /> ) ).toBe( false );
		} );
	} );
} );

describe( 'PurchaseIcon gridicons for non plans', () => {
	test( 'Domains', () => {
		const purchase = {
			productId: 1,
			productSlug: domainProductSlugs.TRANSFER_IN,
			productName: 'Ignored',
			is_domain_registration: false,
		};
		const wrapper = shallow( <PurchaseIcon purchase={ purchase } /> );
		expect( wrapper.contains( <Gridicon icon={ 'domains' } size={ 24 } /> ) );
	} );

	test( 'Themes', () => {
		const purchase = {
			productId: 1,
			productSlug: 'premium_theme',
			productName: 'Ignored',
			is_domain_registration: false,
		};
		const wrapper = shallow( <PurchaseIcon purchase={ purchase } /> );
		expect( wrapper.contains( <Gridicon icon={ 'themes' } size={ 24 } /> ) );
	} );

	test( 'Google Apps (mail)', () => {
		const purchase = {
			productId: 1,
			productSlug: 'gapps_unlimited',
			productName: 'Ignored',
			is_domain_registration: false,
		};
		const wrapper = shallow( <PurchaseIcon purchase={ purchase } /> );
		expect( wrapper.contains( <Gridicon icon={ 'mail' } size={ 24 } /> ) );
	} );
} );
